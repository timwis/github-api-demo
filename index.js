var Github = require('github-api')
var $ = require('jquery')
var serialize = require('form-serialize')

var config = {
  GITHUB_CLIENT: '4c6ff621b5b2d1878a10',
  GATEKEEPER_HOST: 'http://local-gatekeeper.herokuapp.com'
}
var currentURL = window.location.href
var authCodeMatch = window.location.href.match(/\?code=([a-z0-9]*)/)
var github

if (authCodeMatch) {
// If URL has ?code=XXXX in it, use it to fetch oauth token
  var authCode = authCodeMatch[1]
  var authURL = config.GATEKEEPER_HOST + '/authenticate/' + authCode
  $.getJSON(authURL, function (data) {
    console.log('auth response', data)
    github = new Github({
      token: data.token,
      auth: 'oauth'
    })
    fetchUser()
  })
}

// When user clicks login
$('[data-hook~=login-link]').on('click', function (e) {
  var redirectUrl = 'https://github.com/login/oauth/authorize'
  var redirectParams = {
    client_id: config.GITHUB_CLIENT,
    redirect_uri: currentURL,
    scope: 'public_repo'
  }
  window.location.href = redirectUrl + '?' + $.param(redirectParams)
  e.preventDefault()
})

$('[data-hook~=edit-file]').on('submit', function (e) {
  var formData = serialize(e.currentTarget, { hash: true })
  console.log(formData)
  var repo = github.getRepo(formData.user, formData.repo)
  var commitMsg = 'Test commit'
  repo.writeFile(formData.branch, formData.path, formData.content, commitMsg, function (err, data) {
    if (err) console.error(err)
    console.log('edited file', formData.path, data)
  })
  e.preventDefault()
})

function fetchUser (oauthToken) {
  var user = github.getUser()
  user.getProfile(function (err, userData) {
    if (err) console.error(err)
  	$('[data-hook~=login-link]').hide()
    $('[data-hook~=authenticated]').show()
  	$('[data-hook~=user-name]').text(userData.login)
  })
}
