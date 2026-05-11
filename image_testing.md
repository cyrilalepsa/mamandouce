## TEST AGENT PROMPT – IMAGE INTEGRATION RULES

Follow these rules exactly. Do not overcomplicate.

*** Image Handling Rules ***
- Always use base64-encoded images for all tests and requests.
- Accepted formats: JPEG, PNG, WEBP only.
- Do not use SVG, BMP, HEIC, or other formats.
- Do not upload blank, solid-color, or uniform-variance images.
- Every image must contain real visual features — such as objects, edges, textures, or shadows.
- If the image is not PNG/JPEG/WEBP, transcode to PNG or JPEG before upload.
- Always re-detect and update the MIME type after transformations.
- If animated (GIF, APNG, animated WEBP), extract first frame only.
- Resize large images to reasonable bounds.

## Endpoint to test
POST /api/scanner/analyze-document
Body: { image_base64: string, template: 'admin'|'product'|'list', custom_prompt?: string }
Response: { fields: [{ key, label, value, type, editable }], template, raw_text, confidence }
