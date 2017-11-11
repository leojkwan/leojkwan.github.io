My Blog

### When changing the blog's css, make sure you change only the lanyon and style scss files.

This is the flow: The following files:

- 'src/scss/poole.scss',
- 'src/scss/lanyon.scss',
- 'src/scss/syntax.scss',
- 'src/scss/tags.scss'

all output into **styles.scss**. We then convert at concatenated scss file into styles.css. (In production, we also minify this styles.css file.)



