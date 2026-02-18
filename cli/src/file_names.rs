pub fn build_extracted_image_file_name(page_index: usize, image_index: usize) -> String {
    format!("page-{}-image-{}.png", page_index + 1, image_index + 1)
}

#[cfg(test)]
mod tests {
    use super::build_extracted_image_file_name;

    #[test]
    fn builds_file_name_with_one_based_indexes() {
        assert_eq!(build_extracted_image_file_name(0, 0), "page-1-image-1.png");
        assert_eq!(build_extracted_image_file_name(2, 4), "page-3-image-5.png");
    }
}
