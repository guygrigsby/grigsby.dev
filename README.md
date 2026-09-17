# grigsby.dev

Personal page. Astro, one static page, deployed to Cloudflare.

    make          # build into dist/
    make dev      # local server
    make check    # lint, unit tests, build, browser smoke tests
    make redeploy # check, then ship

## Projects on the page

`src/data/projects.ts` is the allowlist: the name the page shows and the repo
it reads. Titles and blurbs come from each repo's GitHub description, so the
page cannot say something the repo does not. Editing a description on GitHub
is how you edit the page.

    make refresh  # re-read descriptions into src/data/repos.snapshot.json

The build reads that committed snapshot, never the network, so it is
deterministic and works offline. CI refreshes before deploying and commits the
result; a GitHub outage ships the previous snapshot rather than failing.

A repo that is going public but is not yet carries a `pending` blurb in the
allowlist, because GitHub will not serve a description for it. `make refresh`
fails once that repo is public with its own description, so the local copy
cannot outlive its reason.

## Deploy

Cloudflare, on push to `main`, on `repository_dispatch` from a project repo,
and weekly as a backstop. Needs `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` in repo secrets.
