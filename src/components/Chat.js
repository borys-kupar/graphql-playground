import React, { Component } from 'react'
import '../styles/Chat.css'
import ChatInput from './ChatInput'
import ChatMessages from './ChatMessages'
import { graphql, compose } from 'react-apollo'
import qql from 'graphql-tag'

const MSG_QUERY = qql`
  query MessageQuery {
    allMessages(last: 100) {
      id
      text
      createdAt
    }
  }
`

const CREATE_MSG_QUERY = qql`
  mutation CreateMessageMutation($text: String!, $sentById: ID! ) {
    createMessage(text: $text, sentById: $sentById) {
      id
      text
      createdAt
      sentBy {
        id
        name
      }
    }
  }
`

const MSG_SUBSCRIPTION = qql`
  subscription NewMessageSubscription {
    Message(filter:{
      mutation_in: [CREATED]
    }) {
      node {
        id
        text
        createdAt
        sentBy {
          id
          name
        }
      }
    }
  }
`

class Chat extends Component {

  state = {
    message: '',
    allMessages: []
  }

  componentDidMount() {
    this.createMessageSubscription = this.props.messageQuery.subscribeToMore({
      document: MSG_SUBSCRIPTION,
      updateQuery: (previousState, {subscriptionData}) => {
        console.log(`Received: ${subscriptionData.Message.node.text}`)
        const newMessage = subscriptionData.Message.node
        const messages = previousState.allMessages.concat([newMessage])
        return {
          allMessages: messages
        }
      }
    })
  }

  render() {
    return (
      <div className='Chat'>
        <ChatMessages
          messages={this.props.messageQuery.allMessages || []}
          endRef={this._endRef}
        />
        <ChatInput
          message={this.state.message}
          onTextInput={(message) => this.setState({message})}
          onResetText={this._resetText}
          onSend={this._onSend}
        />
      </div>
    )
  }

  _onSend = () => {
    console.log(`Send: ${this.state.message}`)
    this.props.createMessageMutation({
      variables: {
        text: this.state.message,
        sentById: this.props.userId
      }
    })
  }

  _resetText = () => {
    this.setState({message: ''})
  }


  /*
   * AUTO SCROLLING
   */

  _endRef = (element) => {
    this.endRef = element
  }

  componentDidUpdate(prevProps) {
    // scroll down with every new message
    if (this.endRef) {
      this.endRef.scrollIntoView()
    }
  }

}

export default compose(
  graphql(MSG_QUERY, { name: 'messageQuery' }),
  graphql(CREATE_MSG_QUERY, { name: 'createMessageMutation' })
)(Chat)