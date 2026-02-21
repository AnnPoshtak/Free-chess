import "./App.css";
import BoardLayout from "./components/BoardLayout/BoardLayout";
import { Container } from "./components/Container/Container";

const App: React.FC = () => {
  return (
    <Container>
      <BoardLayout />
    </Container>
  );
};

export default App;
