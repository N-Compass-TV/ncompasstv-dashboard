import { PlaylistContent } from '../type/PlaylistContentUpdate';

export interface SavePlaylistContentUpdate {
	contentUpdates: PlaylistContent[];
	blacklistUpdates?: { playlistContentId: string; licenses: string[] };
}
