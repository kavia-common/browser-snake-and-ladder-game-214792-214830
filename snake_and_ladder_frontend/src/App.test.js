import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders snake & ladder title", () => {
  render(<App />);
  const heading = screen.getByText(/snake & ladder/i);
  expect(heading).toBeInTheDocument();
});
