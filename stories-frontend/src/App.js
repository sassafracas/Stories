import React, { Component, Fragment } from 'react';
import './App.css';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import LoginForm from "./LoginForm"
import Welcome from "./Welcome"
import NavBar from "./NavBar"
import Adapter from "./Adapter"
import RegistrationForm from "./RegistrationForm"
import Explore from "./Explore"
import MyStories from "./MyStories"
import Upload from "./Upload"
import PhotoDetails from "./PhotoDetails"

class App extends Component {

  state = {
    username: "",
    password: "",
    currentUserId: "",
    photostories: [],
  }

  componentDidMount(){
    console.log("is this first");
    localStorage.getItem('token') ? Adapter.getCurrentUser(localStorage.getItem('token')).then(r=>r.json()).then(r => this.addTokenInfoToState(r)).then(()=>this.getAllUserStories()) : this.props.history.push("/")
  }

  editCaptionInState = (editedPhoto) => {
    let foundPhotostory = this.state.photostories.find(photostory => photostory.id === editedPhoto.photo_story_id)
    let foundPhotoIndex = foundPhotostory.photos.findIndex((photo, index) => photo.id === editedPhoto.id)
    this.setState({
      photostories: [...this.state.photostories, foundPhotostory.photos[foundPhotoIndex] = editedPhoto]
    }, () => {
      console.log("after setting state ", this.state.photostories)
    })
    console.log("photo index ", foundPhotoIndex);
    console.log("hi you're editing ", this.state.photostories);
  }

  getAllUserStories = () => {
    console.log("get all user stories ", this.state);
    Adapter.getAllMyStories(localStorage.getItem('token'), this.state.currentUserId)
    .then(r => r.json())
    .then(json => {console.log("getallusers ", json);return json.map(photostory => this.getPhotos(photostory))})
  }

  getPhotos = (photostory) => {
    Adapter.getAllPhotosForStory(photostory.id).then(r => r.json()).then(json => this.addPhotosToState(json, photostory))
  }

  addPhotosToState = (json, photostory) => {
    photostory["photos"] = json
    this.setState({
      photostories: [...this.state.photostories, photostory]
    }, () => console.log("add photos to state ",this.props))

  }

  addTokenInfoToState = (r) => {
    this.setState({
      currentUserId: r.id,
      username: r.username
    }, ()=> console.log(this.state))
  }

  deletePhotostory = (photostory) => {
    Adapter.deleteOnePhotostory(photostory.id).then(r => r.json()).then(r=> r.map(photostory=> this.getPhotos(photostory)))
    console.log(photostory);
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleLogInSubmit = (event) => {
    event.preventDefault()

    fetch(`http://localhost:3000/sessions/`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({username: this.state.username, password: this.state.password})
    })
      .then(r => r.json())
      .then(json => {
        this.setState({currentUserId: json.id}, this.setTokenAndPushHistory(json))
      })
  }

  setTokenAndPushHistory = (json) => {
    localStorage.setItem('token', json.token);
    Adapter.getCurrentUser(localStorage.getItem('token')).then(r=>r.json()).then(r => this.addTokenInfoToState(r)).then(()=>this.getAllUserStories())
    this.props.history.push("/my-stories");
  }

  render() {
    return (
      <div className="App">
        <NavBar routeInfo={this.props}/>
        <Route exact path="/" component={Welcome} />
          { Adapter.isLoggedIn() ?
            <Fragment>
              <Route exact path="/explore" component={Explore} />
              <Route exact path="/my-stories" component={(props) => <MyStories {...this.state} history={props.history} deletePhotostory={this.deletePhotostory} editCaptionInState={this.editCaptionInState}  />} />
              <Route exact path="/upload" component={Upload} />
              <Route exact path="/my-stories/:id" component={(props) => <PhotoDetails {...this.state} history={props.history} editCaptionInState={this.editCaptionInState}  />} />
            </Fragment>
            :
            <Fragment>
              <Redirect to="/" />
              <Route exact path="/register" component={(props) => <RegistrationForm {...props} />} />
              <Route exact path="/login" component={(props) => <LoginForm {...this.state} {...props} handleLogInSubmit={this.handleLogInSubmit} handleInputChange={this.handleInputChange}/>} />
            </Fragment>
          }

      </div>
    );
  }
}

export default withRouter(App);
