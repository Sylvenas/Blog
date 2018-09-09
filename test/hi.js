class Todo extends Component {
  constructor() {
    super();
    this.state = {
      todoList: [],
      loading: true
    }
  }

  render() {
    const {
      loading,
      todoList
    } = this.state;
    return ( <
      div > {
        loading ? 'loading' : < TodoList list = {
          todoList
        }
        />} <
        /div>
      )
    }
  }
