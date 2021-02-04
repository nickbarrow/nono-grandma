import "./styles.scss";

import Pixelator from './Pixelator'

export default function App() {
  return (
    <div className="App">
      <h1 className="title">nono<span role="img" title="gram" aria-label="Grandma Emoji">👵🏼</span></h1>
      
      <Pixelator src="images/sound-of-perseverance.jpg" />
    </div>
  );
}
