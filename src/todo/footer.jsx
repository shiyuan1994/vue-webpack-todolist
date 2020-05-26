import '../assets/styles/footer.scss'
export default {
  data () {
    return {
      author: 'shirley'
    }
  },
  render () {
    return (
      <div class="footer">
        <span>written by {this.author} </span>
      </div>
    )
  }
} 