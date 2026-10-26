# Landing page — video na picha za simulation (mkataba wa backend)

Frontend inaita: `GET {API_URL}/public/showcase/` (bila token, public).
Ikiwa endpoint haipo / inarudisha tupu, sehemu inaonyesha placeholders "Coming soon" (layout inabaki).

```json
{
  "videos": [
    {
      "id": 1,
      "title": "Buck converter in Simulink",
      "description": "Closed-loop voltage control with PI tuning.",
      "video_url": "https://cdn.example.com/v/buck.mp4",
      "thumbnail_url": "https://cdn.example.com/t/buck.jpg",
      "duration": "02:35",
      "software": "Simulink"
    }
  ],
  "images": [
    {
      "id": 1,
      "title": "Thermal analysis result",
      "caption": "Temperature distribution on heat sink (ANSYS).",
      "image_url": "https://cdn.example.com/i/thermal.jpg",
      "software": "ANSYS"
    }
  ]
}
```

- `video_url`: faili la `.mp4/.webm` AU kiungo cha YouTube / Vimeo (frontend inatambua na ku-embed yenyewe).
- Thumbnails: 16:9 (mfano 1280x720). Picha za gallery: 4:3 (mfano 1200x900), chini ya ~300 KB, JPG/WebP.
- Mpangilio: array inaonyeshwa kama ilivyo; video ya kwanza ndiyo featured. Admin apange `order` upande wa backend.
- CORS: ruhusu domain ya frontend kwa endpoint hii na kwa CDN ya media.
