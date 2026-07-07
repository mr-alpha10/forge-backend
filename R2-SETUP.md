# Image hosting on Cloudflare R2

Goal: serve the ~1,750 exercise images from R2 instead of hotlinking GitHub, so
the app is fast, stable, and yours. R2 has no egress fees and a 10 GB free tier,
so at ~28 MB this is effectively free.

The app already expects this: every `Exercise.images[]` value is a path like
`Barbell_Bench_Press_-_Medium_Grip/0.jpg`, and the front end builds the full URL
as `NEXT_PUBLIC_IMAGE_BASE + path`. So all we do is (1) get the images into R2
with keys that match those paths, and (2) point `NEXT_PUBLIC_IMAGE_BASE` at the
bucket's public URL.

## Which images to upload

Use the resized set from the offline bundle (`forge-workout/images/`, ~28 MB,
phone-sized). The upload script converts the flattened filenames (`A__0.jpg`)
back into nested keys (`A/0.jpg`) so they line up with the seed. If you'd rather
host full-resolution originals, point `UPLOAD_DIR` at a folder of the originals
in nested form instead — the script handles both.

## Steps

1. **Create the bucket.** Cloudflare dashboard → R2 → Create bucket
   (e.g. `forge-exercises`). Activating R2 may ask for a card even on the free
   tier. Leave location on Automatic.

2. **Create S3 API credentials.** R2 Overview → Account details → **Manage API
   Tokens** → Create User API Token → permission **Object Read & Write**. Copy
   the **Access Key ID** and **Secret Access Key** (shown once). Your **Account
   ID** is on the R2 overview page.

3. **Fill env** (in `.env`):
   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=forge-exercises
   R2_KEY_PREFIX=            # leave blank so keys match the seed paths exactly
   UPLOAD_DIR=./forge-workout/images
   ```

4. **Upload.**
   ```
   npm i -D @aws-sdk/client-s3
   DRY=1 npm run images:upload    # sanity-check the key mapping first
   npm run images:upload          # ~1,750 small files, a minute or two
   ```

5. **Make the bucket public.** Bucket → Settings → Public access. Two options:
   - **Custom domain** (recommended): bind e.g. `img.yourdomain.com`. Served from
     Cloudflare's edge, cached, fastest, cheapest.
   - **Managed `r2.dev` subdomain**: one click, gives a `pub-<hash>.r2.dev` URL.
     Fine to start; rate-limited and not meant for production scale.

6. **Point the app at it.** Set the public base (note the trailing slash):
   ```
   NEXT_PUBLIC_IMAGE_BASE="https://img.yourdomain.com/"
   ```
   Now `NEXT_PUBLIC_IMAGE_BASE + "Barbell_Bench_Press_-_Medium_Grip/0.jpg"`
   resolves to a real, cached image.

## Notes

- `<img>` tags don't need CORS, so for displaying images you can skip CORS
  config. Only add a CORS rule (Bucket → Settings → CORS) if you later fetch
  images from JavaScript.
- The script sets `Cache-Control: public, max-age=31536000, immutable`, so once
  an image is fetched it's cached at the edge and in the browser indefinitely —
  good, since these files never change.
- Re-running the upload is safe; it just overwrites identical keys.
- Zero-setup fallback if you want to skip R2 for now: copy the nested images into
  `public/exercises/` in your Next.js app and set `NEXT_PUBLIC_IMAGE_BASE=/exercises/`.
  Works immediately, but bloats the repo/deploy — fine for local, R2 is better
  once you share it.
