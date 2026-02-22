import "./App.css";
import BoardLayout from "./components/BoardLayout/BoardLayout";
import Header from "./components/Header/Header";
import { Container } from "./components/Container/Container";

const App: React.FC = () => {
  return (
    <Container>
        <Header />
      <BoardLayout />
    </Container>
  );
};

export default App;
