import * as MediaLibrary from 'expo-media-library';

export type PhotoItem = {
  id: string;
  uri: string;
  createdAt: number;
};

export const loadRecentPhotos = async (): Promise<PhotoItem[]> => {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photos permission denied');
  }

  const assets = await MediaLibrary.getAssetsAsync({
    first: 6,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [MediaLibrary.SortBy.creationTime],
  });

  return assets.assets.map((asset) => ({
    id: asset.id,
    uri: asset.uri,
    createdAt: asset.creationTime || Date.now(),
  }));
};
