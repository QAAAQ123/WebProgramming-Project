var UsersList = React.createClass({
	displayName: 'UsersList',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'users' },
			React.createElement(
				'h3',
				null,
				' 참여자들 '
			),
			React.createElement(
				'ul',
				null,
				this.props.users.map(function (user, i) {
					return React.createElement(
						'li',
						{ key: i },
						user
					);
				})
			)
		);
	}
});

var Message = React.createClass({
	displayName: 'Message',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'message' },
			React.createElement(
				'strong',
				null,
				this.props.user,
				' :'
			),
			React.createElement(
				'span',
				null,
				this.props.text
			)
		);
	}
});

var MessageList = React.createClass({
	displayName: 'MessageList',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'messages' },
			React.createElement(
				'h2',
				null,
				' 채팅방 '
			),
			this.props.messages.map(function (message, i) {
				return React.createElement(Message, {
					key: i,
					user: message.user,
					text: message.text
				});
			})
		);
	}
});

var MessageForm = React.createClass({
	displayName: 'MessageForm',

	getInitialState: function getInitialState() {
		return { text: '' };
	},

	handleSubmit: function handleSubmit(e) {
		e.preventDefault();
		var message = {
			user: this.props.user,
			text: this.state.text
		};
		this.props.onMessageSubmit(message);
		this.setState({ text: '' });
	},

	changeHandler: function changeHandler(e) {
		this.setState({ text: e.target.value });
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'message_form' },
			React.createElement(
				'form',
				{ onSubmit: this.handleSubmit },
				React.createElement('input', {
					placeholder: '메시지 입력',
					className: 'textinput',
					onChange: this.changeHandler,
					value: this.state.text
				}),
				React.createElement('h3', null)
			)
		);
	}
});

var ChangeNameForm = React.createClass({
	displayName: 'ChangeNameForm',

	getInitialState: function getInitialState() {
		return { newName: '' };
	},

	onKey: function onKey(e) {
		this.setState({ newName: e.target.value });
	},

	handleSubmit: function handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);
		this.setState({ newName: '' });
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'change_name_form' },
			React.createElement(
				'h3',
				null,
				' 아이디 변경 '
			),
			React.createElement(
				'form',
				{ onSubmit: this.handleSubmit },
				React.createElement('input', {
					placeholder: '변경할 아이디 입력',
					onChange: this.onKey,
					value: this.state.newName
				})
			)
		);
	}
});

var ChatApp = React.createClass({
	displayName: 'ChatApp',

	getInitialState: function getInitialState() {
		return { users: [], messages: [], text: '' };
	},

	componentDidMount: function componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		socket.on('change:name', this._userChangedName);
	},

	_initialize: function _initialize(data) {
		var users = data.users;
		var name = data.name;

		this.setState({ users: users, user: name });
	},

	_messageRecieve: function _messageRecieve(message) {
		var messages = this.state.messages;

		messages.push(message);
		this.setState({ messages: messages });
	},

	handleMessageSubmit: function handleMessageSubmit(message) {
		var messages = this.state.messages;

		messages.push(message);
		this.setState({ messages: messages });
		socket.emit('send:message', message);
	},

	handleChangeName: function handleChangeName(newName) {
		var _this = this;

		var oldName = this.state.user;
		socket.emit('change:name', { name: newName }, function (result) {
			if (!result) {
				return alert('There was an error changing your name');
			}
			var users = _this.state.users;

			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			_this.setState({ users: users, user: newName });
		});
	},

	render: function render() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'center' },
				React.createElement(UsersList, {
					users: this.state.users
				}),
				React.createElement(ChangeNameForm, {
					onChangeName: this.handleChangeName
				}),
				React.createElement(MessageList, {
					messages: this.state.messages
				}),
				React.createElement(MessageForm, {
					onMessageSubmit: this.handleMessageSubmit,
					user: this.state.user
				})
			)
		);
	}
});