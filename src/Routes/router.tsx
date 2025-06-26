import { createBrowserRouter } from "react-router-dom";
import Repository from "../Repository";
import App from "../App";
import RepositoryGraph from "../components/RepositoryGraph";

export const Router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/repository",
        element: <Repository />,
    },
    {
        path: "/repository/:owner/:repo",
        element: <RepositoryGraph />,
    },
    {
        path: "*",
        element: <div>404</div>,
    },
    
]);