import { RouterProvider } from 'react-router-dom';
import { UsuarioActualProvider } from './context/UsuarioActualContext';
import { router } from './routes';

function App() {
  return (
    <UsuarioActualProvider>
      <RouterProvider router={router} />
    </UsuarioActualProvider>
  );
}

export default App;
