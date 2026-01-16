import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRoutes from './routes/AppRoutes';
import Chatbot from './components/Chat/Chatbot';
import './index.css';

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppRoutes />
                <Chatbot />
            </BrowserRouter>
        </Provider>
    );
}

export default App;
