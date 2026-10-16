# Future Expansion: Server-Rendered Randomized Headlines

## Intent

Randomized headlines should ideally be delivered as ordinary HTML, so the browser does not need JavaScript to select or display the headline.

## My understanding of the approach

1. Maintain the headline variants and their metadata in our existing data model.
2. When a visitor requests the landing page, Cloudflare executes the server-side rendering logic through a Cloudflare Pages Function.
3. Astro selects a random headline and renders its text and associated presentation elements into HTML.
4. Cloudflare returns the completed HTML to the browser.
5. The browser displays the selected headline using CSS, without requiring client-side JavaScript for headline selection or rendering.

This means the random selection happens on the server for each page request, rather than once during the static build or in the visitor's browser.

## Why pursue this?

- JavaScript-disabled browsers can still receive a randomized headline.
- The initial headline is already present in the HTML response.
- The content remains semantic HTML and can be read by assistive technologies.
- CSS can provide visual effects, including fade-in animation, independently of JavaScript.

## Future implementation considerations

- Configure Astro's Cloudflare adapter and on-demand rendering.
- Ensure Cloudflare Pages deploys the server-rendered route correctly.
- Account for caching so that cached responses do not unintentionally prevent fresh random selection.
- Keep server-side selection separate from future client-side features such as discovery tracking and typing animation.

## Scope boundary

This is a future expansion, not part of the current implementation. The current static Astro foundation remains unchanged until this direction is revisited and approved.
