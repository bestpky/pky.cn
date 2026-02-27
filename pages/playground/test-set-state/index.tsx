import React from 'react'

export default class Test extends React.Component<null, { num: number }> {
  constructor(props) {
    super(props)
    this.state = {
      num: 0,
    }
  }
  componentDidMount() {
    setTimeout(() => {
      console.log(this.state.num)
      this.setState({ num: this.state.num + 1 })
      console.log(this.state.num)
    }, 0)
  }
  render() {
    return (
      <div
        className="flex-auto translate-x-[calc(50vw-50%)] flex items-center justify-center"
        onClick={() => {
          this.setState({ num: this.state.num + 1 })
          console.log(this.state.num)
        }}
      >
        {this.state.num}
      </div>
    )
  }
}
