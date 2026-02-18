use std::fmt;

use extract::PageRange;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsePageRangesError {
    message: String,
}

impl ParsePageRangesError {
    fn new(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

impl fmt::Display for ParsePageRangesError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

pub fn parse_page_ranges_text(input: &str) -> Result<Vec<PageRange>, ParsePageRangesError> {
    let mut parsed = Vec::new();

    for token in input.split(',') {
        let trimmed = token.trim();
        if trimmed.is_empty() {
            return Err(ParsePageRangesError::new("range token cannot be empty"));
        }

        parsed.push(parse_page_range(trimmed)?);
    }

    Ok(parsed)
}

fn parse_page_range(input: &str) -> Result<PageRange, ParsePageRangesError> {
    let Some((raw_start, raw_end)) = input.split_once('-') else {
        let page_index = parse_non_negative_page(input)?;
        return Ok(PageRange {
            start: page_index,
            end: page_index,
        });
    };

    if raw_end.contains('-') {
        return Err(ParsePageRangesError::new(format!(
            "invalid range text: {input}"
        )));
    }

    let start = parse_non_negative_page(raw_start.trim())?;
    let end = parse_non_negative_page(raw_end.trim())?;

    Ok(PageRange {
        start: start.min(end),
        end: start.max(end),
    })
}

fn parse_non_negative_page(input: &str) -> Result<usize, ParsePageRangesError> {
    let value: usize = input
        .parse()
        .map_err(|_| ParsePageRangesError::new(format!("invalid page number: {input}")))?;
    Ok(value.saturating_sub(1))
}

#[cfg(test)]
mod tests {
    use super::parse_page_ranges_text;
    use extract::PageRange;

    #[test]
    fn parses_single_page() {
        assert_eq!(
            parse_page_ranges_text("1").unwrap(),
            vec![PageRange { start: 0, end: 0 }]
        );
    }

    #[test]
    fn parses_mixed_ranges() {
        assert_eq!(
            parse_page_ranges_text("1, 3-5").unwrap(),
            vec![
                PageRange { start: 0, end: 0 },
                PageRange { start: 2, end: 4 }
            ]
        );
    }

    #[test]
    fn normalizes_descending_range() {
        assert_eq!(
            parse_page_ranges_text("5-3").unwrap(),
            vec![PageRange { start: 2, end: 4 }]
        );
    }

    #[test]
    fn clamps_zero_to_first_page() {
        assert_eq!(
            parse_page_ranges_text("0").unwrap(),
            vec![PageRange { start: 0, end: 0 }]
        );
    }

    #[test]
    fn rejects_invalid_token() {
        assert!(parse_page_ranges_text("x-2").is_err());
    }

    #[test]
    fn rejects_empty_token() {
        assert!(parse_page_ranges_text("1,,2").is_err());
    }
}
