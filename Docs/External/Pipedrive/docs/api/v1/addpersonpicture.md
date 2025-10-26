# POST /persons/{id}/picture

> **Operation ID:** `addPersonPicture`
> **Tags:** `Persons`

## Add person picture

Adds a picture to a person. If a picture is already set, the old picture will be replaced. Added image (or the cropping parameters supplied with the request) should have an equal width and height and should be at least 128 pixels. GIF, JPG and PNG are accepted. All added images will be resized to 128 and 512 pixel wide squares.

## Parameters

| Name | Type | In | Required | Description |
|------|------|-------|----------|-------------|
| `id` | integer | path | Yes | The ID of the person |

## Request Body

Content type: `multipart/form-data`

```
- **`file`** (**required**) - string
  One image supplied in the multipart/form-data encoding
- **`crop_x`** (*optional*) - integer
  X coordinate to where start cropping form (in pixels)
- **`crop_y`** (*optional*) - integer
  Y coordinate to where start cropping form (in pixels)
- **`crop_width`** (*optional*) - integer
  The width of the cropping area (in pixels)
- **`crop_height`** (*optional*) - integer
  The height of the cropping area (in pixels)
```

## Responses

**200** - Success

Response type: `application/json`

```

```


## Security

- **api_key**
- **oauth2**: contacts:full