# Feature 08: Modern UI/UX Overhaul (Trendy & Feminine)

## 1. Aesthetic Concept: "Modern Clean Beauty"
- **Vibe:** Trendy, feminine, high-end (like Glossier, Sephora, or Korean aesthetic clinics).
- **Key Visual Elements:**
  - **Split-Screen Layouts:** Hero sections and Auth/Analysis pages MUST be divided into 2 columns (`grid lg:grid-cols-2`). One side for a stunning, full-height image, one side for the interactive form.
  - **Glassmorphism:** Use `bg-white/70 backdrop-blur-lg border border-white/20` for cards floating over soft backgrounds to make it look expensive.
  - **Fluid Backgrounds:** Add blurred color blobs behind the main content (e.g., `<div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/50 rounded-full blur-3xl -z-10"></div>`).

## 2. Typography & Colors
- **Headings:** Serif font (e.g., Playfair Display) with elegant letter spacing (`tracking-tight`).
- **Accents:** Use gradients for primary buttons or text (e.g., `bg-gradient-to-r from-rose-300 to-emerald-400`).
- **Cards & Inputs:** Fully rounded corners (`rounded-3xl`), zero harsh black borders. Use soft, large shadows `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`.

## 3. Placeholder Imagery (CRITICAL)
To avoid a boring, text-heavy layout, you MUST integrate `<img>` tags into the layouts. 
- Use stable placeholders like `https://picsum.photos/seed/skincare/800/1200` for tall image sections.
- Ensure images have `object-cover`, `w-full`, `h-full`, and rounded edges (`rounded-3xl`) to fit the modern aesthetic.