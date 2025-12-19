# Publications & Speaking Page - Documentation for Claude

## Overview
This personal website (`jessemccrosky/index.html`) contains a comprehensive publications and speaking section with 53+ entries spanning 2004-2025.

## Organization Structure

### Chronological Order
- **Between years**: Reverse chronological (newest year first: 2025, 2024, 2023... down to 2004)
- **Within each year**: Reverse chronological (newest date first)
  - Example in 2025: November 14 → November 4-5 → September 12
  - When adding new entries, **ALWAYS** check the date and place it in correct chronological order

### Publication Types & Icons
Each entry has a type indicator icon:
- 🎤 **Speaking**: Conference talks, keynotes, panels, workshops
- ✍️ **Blog/Article**: Blog posts, magazine articles, opinion pieces
- 📄 **Academic**: Peer-reviewed papers, theses, conference proceedings
- 📊 **Report/Whitepaper**: Research reports, whitepapers, ebooks
- 🎙️ **Media**: Podcasts, video series, interviews

## Entry Format

Each publication item should follow this structure:

```html
<div class="publication-item">
    <span class="pub-type">[icon]</span>
    <div class="pub-content">
        <!-- If co-authored, list all authors first -->
        <span class="pub-authors">[LastName, I., LastName, I., McCrosky, J., LastName, I.]</span>

        <!-- OPTION 1: Link is to the specific work (article, video, paper) -->
        <a href="[URL-to-specific-work]" class="pub-title" target="_blank" rel="noopener">[Title]</a>
        <span class="pub-venue">[Venue name], [location], [date]</span>

        <!-- OPTION 2: Link is to the event/conference (not specific talk) -->
        <span class="pub-title-plain">[Talk/Presentation Title]</span>
        <span class="pub-venue"><a href="[URL-to-event]" target="_blank" rel="noopener">[Event name]</a>, [location], [date]</span>

        <!-- OPTION 3: No link available -->
        <span class="pub-title-plain">[Title]</span>
        <span class="pub-venue">[Venue name], [location], [date]</span>
    </div>
</div>
```

**Examples:**
- **Blog post with direct link**: Link goes on title - `<a href="[blog-url]" class="pub-title">Blog Post Title</a>`
- **Conference talk at event**: Link goes on event - `<span class="pub-title-plain">Talk Title</span>` + `<a href="[event-url]">Conference Name</a>`
- **Academic paper**: Link goes on title - `<a href="[doi-or-paper-url]" class="pub-title">Paper Title</a>`

## Key Rules

### 1. Always Include Links When Available
- Every entry should have **at least one link** if possible
- **Link placement policy**:
  - **If the link is to the specific work** (article, video, paper, slides): Link the title
  - **If the link is to the event/conference/publication** (not the specific talk): Link the event/venue name, use `pub-title-plain` for the talk title
  - Example for specific work: `<a href="[blog-post-url]" class="pub-title">Blog Post Title</a>`
  - Example for event: `<span class="pub-title-plain">Talk Title</span>` with `<span class="pub-venue"><a href="[event-url]">Event Name</a>, date</span>`
- Search for links if not immediately available

### 2. Co-Author Attribution
- List **all co-authors** for collaborative work
- Format: `LastName, I.` (e.g., "Beknazar-Yuzbashev, G., Jiménez-Durán, R., McCrosky, J., Stalinski, M.")
- Place author list **before** the title in `<span class="pub-authors">`

### 3. Venue Information
- Use **full official names** (not abbreviations)
  - ✅ "Computers, Privacy, and Data Protection 2023"
  - ❌ "CPDP 2023"
- Include dates when specific (especially for 2024-2025 entries)
- Include locations for conferences/events when known
- Add context in parentheses: "(panelist)", "(workshop leader)", "(keynote)", etc.

### 4. Adding New Publications

**CRITICAL**: When adding new entries, you MUST:

1. **Determine the date** (fetch the page or search if needed)
2. **Find the correct year section**
3. **Place in reverse chronological order within that year** (newest first)
4. **Verify all links work**
5. **Include complete information**: authors, title, venue, date

**Example workflow for adding a new blog post:**
```
1. Fetch URL to get title and date
2. Identify year (e.g., 2025)
3. Find position: If dated November 14, goes BEFORE November 4 entry, AFTER December entries
4. Add with proper icon (✍️ for blog)
5. Include date in venue: "The Linux Foundation Blog, November 14, 2025"
```

## Styling Notes

### CSS Classes
- `.year-section` - Container for each year
- `.year-header` - Year number (h3)
- `.publication-item` - Individual entry container
- `.pub-type` - Icon indicator
- `.pub-content` - Main content wrapper
- `.pub-authors` - Author list (gray, smaller font)
- `.pub-title` - Linked title (blue, hover orange)
- `.pub-title-plain` - Non-linked title (dark gray)
- `.pub-venue` - Venue/publication info (italic, gray)
- `.pub-venue a` - Links within venue (blue, hover orange)

### Color Scheme (Nordic Theme)
- Primary text: `var(--nordic-dark)` #2D3748
- Links/headers: `var(--nordic-blue)` #2C5282
- Hover/accents: `var(--nordic-accent)` #D97706
- Meta text: `var(--nordic-gray)` #4A5568

## Common Mistakes to Avoid

❌ **DON'T**: Add entries without checking chronological order
❌ **DON'T**: Skip adding links when they're available
❌ **DON'T**: Use abbreviations for venue names
❌ **DON'T**: Forget to include co-authors
❌ **DON'T**: Add entries to the wrong year

✅ **DO**: Fetch page details before adding
✅ **DO**: Verify chronological placement within year
✅ **DO**: Include all available information (authors, dates, venues)
✅ **DO**: Test links after adding
✅ **DO**: Match the existing formatting patterns

## Source File

The original source data is in: `/Users/jessemccrosky/Downloads/Jesse Publications.md`

However, this file may not be kept up to date. The **canonical source** is the HTML file itself. When adding new publications, add them directly to the HTML in the correct chronological position.

## Maintenance

When updating the publications section:
1. Read the current HTML to understand existing entries
2. Determine where new entry fits chronologically
3. Add with complete information and proper formatting
4. Verify the change maintains visual consistency
5. Test that all links work

## File Location

Main file: `/Users/jessemccrosky/git/incitefuldataconsulting/jessemccrosky/index.html`
Publications section: Lines ~471-960 (as of last update)
