import Container from './Container.jsx';

export default function Footer() {
  const college = import.meta.env.VITE_COLLEGE_NAME;

  return (
    <footer className="mt-12 border-t border-line">
      <Container className="py-6 text-sm text-muted">
        Campus Exchange is for {college} students only. Deals are made in person, so meet on
        campus and check the item before you pay.
      </Container>
    </footer>
  );
}