import { html, render, Component } from "../libs/htm.js";
import { isMobile } from "../utils.js";
import { IconButton } from "./common.js";
import { Marks } from "./marks.js";
import { Tracks } from "./tracks.js";

export const createLeftPanel = ({
  map,
  markerStore,
  trackStore,
  authStore,
  uiStore,
}) => {
  const panel = { refresh: () => {}, addItems: () => {}, addTrack: () => {} };
  const marks = new Marks({ map, panel, markerStore });
  const tracks = new Tracks({ map, panel, trackStore });
  panel.addItems = (items) => marks.addItems(items);
  panel.addTrack = (track) => tracks.addTrack(track);
  let authenticated = authStore.isAuthenticated();

  authStore.subscribeAuth(() => {
    authenticated = authStore.isAuthenticated();
    console.log("on auth update", authenticated);
    panel.refresh();
  });

  const MARKS_TAB = "marks";
  const TRACKS_TAB = "tracks";
  class LeftPanel extends Component {
    componentDidMount() {
      panel.refresh = this.refresh.bind(this);
      this.setShowPanel(!isMobile());
      this.setState({
        showPanel: !isMobile(),
        refresh: Date.now(),
        mapUrl: "",
        tab: MARKS_TAB,
        leftWidth: uiStore.leftWidth,
        sliderIsPressed: false,
      });
    }

    refresh() {
      this.setState({ refresh: Date.now() });
    }

    setShowPanel(value) {
      this.setState({ showPanel: value });
    }

    onShowQR() {
      window.location.href = "/admin";
      console.log("onShowQR", this.state.mapUrl);
      // const typeNumber = 4;
      // const errorCorrectionLevel = 'L';
      // const qr = window.qrcode(typeNumber, errorCorrectionLevel);
      // const map = 'test'
      // const mapUrl = `${location.origin}/download/${map}`
      // qr.addData(mapUrl);
      // qr.make();
      // document.getElementById('qr').innerHTML = qr.createImgTag();
      // this.setState({ mapUrl })
    }

    onCloseQR() {
      window.document.getElementById("qr").innerHTML = "";
      this.setState({ mapUrl: "" });
    }

    onStartMoveSlider() {
      if (!this.state.sliderIsPressed) {
        this.setState({ sliderIsPressed: true });
        const onMoveSlider = this.onMoveSlider.bind(this);
        const onUp = () => {
          window.removeEventListener("mousemove", onMoveSlider);
          window.removeEventListener("mouseup", onUp);
          this.setState({ sliderIsPressed: false });
        };
        window.addEventListener("mousemove", onMoveSlider);
        window.addEventListener("mouseup", onUp);
      }
    }

    onMoveSlider(e) {
      if (this.state.sliderIsPressed) {
        console.log("onMoveSlider", e.clientX, e);
        this.setState({ leftWidth: e.clientX });
        uiStore.setLeftWidth(e.clientX);
      }
    }

    render(_, { showPanel, tab, leftWidth }) {
      if (showPanel) {
        return html` 
        <div class="h-100 row">
          <div class="col h-100" style=${{ width: leftWidth }}>
            <div class="row inverse-color center">
              <img src="assets/logo.png" />
              <h5>2 Карты</h5>
            </div>
            <div class="row inverse-color">
              <div class="row col-sm-10">
                  <button class="small inverse" style=${{
                    color: tab === MARKS_TAB ? "darkseagreen" : "white",
                  }} onClick=${() =>
          this.setState({ tab: MARKS_TAB })}>Метки</button>
                  <button class="small inverse" style=${{
                    color: tab === TRACKS_TAB ? "darkseagreen" : "white",
                  }} onClick=${() =>
          this.setState({ tab: TRACKS_TAB })}>Треки</button>
              </div>
              <${IconButton}
                icon="assets/backArrow.svg"
                className="small inverse"
                onClick=${() => this.setShowPanel(false)}
              />
            </div>
            ${tab === MARKS_TAB ? marks.render() : tracks.render()}

            <div class="col inverse-color">
              <div class="row center">
              ${
                authenticated
                  ? html` <button
                        class="col-sm-5 small inverse"
                        onClick=${() => this.onShowQR()}
                      >
                        閙
                      </button>

                      <button
                        class="col-sm-5 small inverse"
                        onClick=${() => authStore.logout()}
                      >
                        Logout
                      </button>`
                  : html`<button
                        class="col-sm-5 small inverse"
                        onClick=${() => authStore.showLogin()}
                      >
                        Login</button
                      >/
                      <button
                        class="col-sm-5 small inverse"
                        onClick=${() => authStore.showSignUp()}
                      >
                        Sign Up
                      </button>`
              }
              </div>
              <div class="col center">
                <a class="center" href="http://www.etomesto.ru/">карты c etomesto.ru</a>
                <a class="center" href="https://github.com/mikhail-angelov/mapnn"><img src="assets/github.svg"></img>исходники</a>
              </div>
          </div>  
        </div>
        <div class="h-100" style=${{
          borderRight: "2px solid gray",
          width: "10px",
          cursor: "col-resize",
          backgroundColor: "transparent",
          marginLeft: "-10px",
        }}
         onMouseDown=${() => this.onStartMoveSlider()}
        ></div>
      </div>
      `;
      }
      return html`<${IconButton}
        className="small"
        icon="assets/rightArrow.svg"
        onClick=${() => this.setShowPanel(true)}
      />`;
    }
  }

  render(html`<${LeftPanel} />`, document.getElementById("left-panel"));

  return panel;
};
