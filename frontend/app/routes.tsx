import ErrorPage from 'hooks/error';
import { useEffect } from 'react';

const MyComponent = () => {
  return <div>Hello, World!</div>;
};

export default function Routes() {


  return (
    <div>
      <ErrorPage />
    </div>
  );
}
