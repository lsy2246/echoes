import { Template } from 'interface/template';

export default new Template(
  {
    layout: "default",
  },
  ({ http,args }) => {
    return (
      <div>
        Hello World
      </div>
    );
  },

); 