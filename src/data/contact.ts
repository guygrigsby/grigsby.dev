/** Split on purpose. The page never emits the address, in text or in a
    mailto:, and the two halves are base64 in the markup, so the ordinary
    crawlers that scrape with a regex over HTML come away with nothing. This
    stops bulk harvesting, not a person who opens devtools. The durable half of
    the defense is the address itself being an alias you can delete. */
export const email = {
  user: 'hi',
  domain: 'grigsby.dev',
}

export const encoded = {
  user: Buffer.from(email.user).toString('base64'),
  domain: Buffer.from(email.domain).toString('base64'),
}

/** What a reader sees with javascript off. Human-readable, not machine-clean. */
export const spelled = `${email.user} at ${email.domain}`

/** Envelope, stroked, on a 24 box like the brand marks. */
export const markPath = 'M3.25 6.25h17.5v11.5H3.25zM3.6 6.7 12 12.6l8.4-5.9'
