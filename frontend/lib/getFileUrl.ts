const getFileUrl = (file) => {
  if (!file) {
    return "";
  }
  const backendUrl = process.env.NEXT_PUBLIC_ASSETS_URL;

  // remove /api
  const url = backendUrl?.replace(/\/api$/, "");
  // @ts-ignore
  return file ? (file.startsWith("/") ? `${url}${file}` : file) : undefined;
};

export default getFileUrl;
