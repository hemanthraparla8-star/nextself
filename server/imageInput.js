function dataUrlFromUpload(file) {
  if (!file) return null;
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

function imageInputFromRequest(req) {
  const uploaded = dataUrlFromUpload(req.file);
  if (uploaded) return uploaded;

  const imageUrl = req.body?.imageUrl || req.body?.imageUri;
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return imageUrl.trim();
  }

  return null;
}

module.exports = {
  imageInputFromRequest,
};
