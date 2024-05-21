import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import './App.css';

import Uploading from './uploadinglogic/uploading';
import Header from './header/headers';
import Getuploads from './getuploads/getuploads';

function App() {
  return (
    <Router>
    <div className="App">
      <Header/>
   
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/uploading" element={<Uploading />} />
          <Route path="/getuploads" element={<Getuploads />} />
     
     
        </Routes>
     
    </div>
    </Router>
  );
}

const Home = () => (
  <div>
    <h2>Home Page</h2>
    <p>Welcome to the home page!</p>
  </div>
);

export default App;
