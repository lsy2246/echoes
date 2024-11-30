import { Template } from 'core/template';

export default new Template(
  "page",
  {
    layout: "default",
  },
  ({ http }) => {
    return (
      <div>
        Hello World
      </div>
    );
  }
); 