mod file_names;
mod page_ranges;

use std::collections::HashMap;
use std::fmt;
use std::io;
use std::path::{Path, PathBuf};

use clap::Parser;

use crate::file_names::build_extracted_image_file_name;
use crate::page_ranges::{ParsePageRangesError, parse_page_ranges_text};

#[derive(Debug, Parser)]
#[command(name = "pdf-img-extract")]
#[command(about = "Extract raster images from a PDF into PNG files")]
struct Cli {
    /// PDF file path
    input_pdf: PathBuf,

    /// Output directory (default: <input_basename>-images)
    #[arg(short, long)]
    output: Option<PathBuf>,

    /// Page ranges using 1-based indexes, e.g. "1,3-5"
    #[arg(short = 'p', long = "pages")]
    pages: Option<String>,
}

#[derive(Debug)]
struct RunOutcome {
    image_count: usize,
    warning_count: usize,
    output_dir: PathBuf,
}

#[derive(Debug)]
enum CliError {
    InvalidRanges(ParsePageRangesError),
    ReadInput { path: PathBuf, source: io::Error },
    CreateOutputDir { path: PathBuf, source: io::Error },
    Extract(extract::ExtractError),
    SaveImage { path: PathBuf, message: String },
}

impl fmt::Display for CliError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CliError::InvalidRanges(err) => write!(f, "failed to parse --pages: {err}"),
            CliError::ReadInput { path, source } => {
                write!(f, "failed to read input PDF {}: {source}", path.display())
            }
            CliError::CreateOutputDir { path, source } => {
                write!(
                    f,
                    "failed to create output directory {}: {source}",
                    path.display()
                )
            }
            CliError::Extract(err) => write!(f, "failed to extract images: {err}"),
            CliError::SaveImage { path, message } => {
                write!(f, "failed to save PNG {}: {message}", path.display())
            }
        }
    }
}

fn main() {
    if let Err(err) = run_cli(Cli::parse()) {
        eprintln!("{err}");
        std::process::exit(1);
    }
}

fn run_cli(cli: Cli) -> Result<(), CliError> {
    let outcome = run(cli)?;
    let output_dir = normalize_output_dir(&outcome.output_dir);
    println!(
        "extracted {} images ({} warnings)",
        outcome.image_count, outcome.warning_count
    );
    println!("output directory: {}", output_dir.display());
    Ok(())
}

fn run(cli: Cli) -> Result<RunOutcome, CliError> {
    let page_ranges = cli
        .pages
        .as_deref()
        .map(parse_page_ranges_text)
        .transpose()
        .map_err(CliError::InvalidRanges)?
        .unwrap_or_default();

    let input_pdf_path = cli.input_pdf;
    let output_dir = cli
        .output
        .unwrap_or_else(|| default_output_dir(&input_pdf_path));

    let pdf_bytes = std::fs::read(&input_pdf_path).map_err(|source| CliError::ReadInput {
        path: input_pdf_path.clone(),
        source,
    })?;

    std::fs::create_dir_all(&output_dir).map_err(|source| CliError::CreateOutputDir {
        path: output_dir.clone(),
        source,
    })?;

    let result = extract::extract_images(&pdf_bytes, &page_ranges).map_err(CliError::Extract)?;

    let mut image_index_by_page: HashMap<usize, usize> = HashMap::new();

    for extracted in result.images {
        let image_index = image_index_by_page.entry(extracted.page_index).or_insert(0);
        let file_name = build_extracted_image_file_name(extracted.page_index, *image_index);
        *image_index += 1;

        let output_path = output_dir.join(file_name);
        extracted
            .image
            .save(&output_path)
            .map_err(|source| CliError::SaveImage {
                path: output_path,
                message: source.to_string(),
            })?;
    }

    let warning_count = result.errors.len();
    for warning in result.errors {
        eprintln!("warning: page {}: {}", warning.page_index + 1, warning.kind);
    }

    Ok(RunOutcome {
        image_count: image_index_by_page.values().sum(),
        warning_count,
        output_dir,
    })
}

fn default_output_dir(input_pdf_path: &Path) -> PathBuf {
    let base_name = input_pdf_path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .map(str::trim)
        .filter(|name| !name.is_empty())
        .unwrap_or("images");

    PathBuf::from(format!("{base_name}-images"))
}

fn normalize_output_dir(path: &Path) -> PathBuf {
    std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf())
}

#[cfg(test)]
mod tests {
    use super::default_output_dir;
    use std::path::Path;

    #[test]
    fn default_output_uses_input_stem() {
        assert_eq!(
            default_output_dir(Path::new("sample.pdf")),
            Path::new("sample-images")
        );
    }
}
