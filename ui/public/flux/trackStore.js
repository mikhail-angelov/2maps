import { Store } from "./store.js";
import { get, post } from "../utils.js";

export class TrackStore extends Store {
  tracks = [];
  selected = null
  loading = false

  async loadAll() {
    try {
      this.tracks = await get("/tracks");
    } catch (e) {
      console.log("cannot get tracks", e);
    }
    this.refresh();
  }
  getAll() {
    return this.tracks;
  }
  async add(track) {
    try{
        await post('/tracks', track)
    this.tracks = [...this.tracks, track];
    this.refresh();
    }catch(e){
        console.log('failed to add track')
    }
  }
  remove(id) {
    this.tracks = this.tracks.filter((item) => item.id !== id);
    this.refresh();
  }
  update(track) {
    this.tracks = this.tracks.map((item) =>
      item.id === track.id ? track : item
    );
    this.refresh();
  }
  select(track){
    this.selected = track
    this.refresh();
  }
}
