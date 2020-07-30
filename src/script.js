function ce(element) {
  return document.createElement(element)
}
class Proposal {
  constructor(id, title, author, description, link, notes) {
    this.id = id
    this.title = title
    this.author = author
    this.description = description
    this.link = link
    this.notes = notes
  }

  titleHeader() {
    let h = ce('h2')
    h.innerText = this.title
    return h
  }

  authorHeader() {
    let a = ce('h3')
    a.innerText = "Author: " + this.author
    return a
  }

  descriptionText() {
    let d = ce('p')
    d.innerText = "Description: " + this.description
    return d
  }

  documentLink() {
    let l = ce('a')
    l.href = this.link
    l.innerText = 'Proposal Document'
    return l
  }

  span() {
    let s = ce('span')
    s.innerText = `${this.title}, ${this.author}`
    return s
  }

  display(div, list) {
    div.innerHTML = ''
    list.innerHTML = ''
    div.append(this.titleHeader(), this.authorHeader(), this.descriptionText(), this.documentLink())
    this.notes.forEach(note => {
      let n = new Note(note.id, note.text, this.id)
      n.load(list)
    })
  }
}

class Note {
  constructor(id, text, proposal_id) {
    this.id = id
    this.text = text
    this.proposal_id = proposal_id
  }

  listItem() {
    let li = ce('li')
    li.innerText = this.text
    return li
  }

  load(list) {
    list.append(this.listItem())
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const proposalDisplay = document.querySelector('div.proposal-display')
  const proposalContainer = document.querySelector('div.proposal-container')
  proposalContainer.style.display = 'none'
  const proposalBar = document.querySelector('div#proposal-bar')
  const notesFormDiv = document.querySelector('div.create-note')
  const noteList = document.querySelector('ul.notes-list')
  const proposalsURL = 'http://localhost:3000/api/v1/proposals'
  const notesURL = 'http://localhost:3000/api/v1/notes'
  const editNotesModal = document.getElementById('edit-notes-modal')
  const modalButton = document.getElementById('edit-notes-button')
  modalButton.style.display = 'none'
  const modalCloseButton = document.getElementById('modal_close')
  const editNoteForm = document.getElementById('edit-note')
  const modalContent = document.querySelector('div.modal-content')

  function displayNewNote(note) {
    const newNote = new Note(note.id, note.text, note.proposal_id)
    newNote.load(noteList)
  }


  function newNote(form) {
    const text = form[0].value
    const prop_id = form[1].value
    form[0].value = ''
    // debugger
    fetch(notesURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        proposal_id: prop_id
      })
    })
      .then(res => res.json())
      .then((newNote) => {
        proposalBar.innerHTML = ''
        displayNewNote(newNote)
        fetchProposals()
      })
  }

  function formClick(form) {
    form.addEventListener('submit', () => {
      event.preventDefault()
      newNote(form)
    })
  }

  async function updateNote() {
    fetch(`${notesURL}/${editNoteForm[0].value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: editNoteForm[1].value
      })
    })
      .then(res => res.json())
      .then(async function (note) {
        proposalBar.innerHTML = ''
        await fetchProposals()
        const spans = document.querySelectorAll('span')
        editNotesModal.style.display = 'none'
        const prop = note.proposal
        // debugger
        spans.find(function (s) { return s.innerText == `${prop.title}, ${prop.author}` }).click()
      })
  }

  function centerProposal(proposal, display, noteList) {
    notesFormDiv.append(noteForm(proposal))
    proposal.display(display, noteList)
    // debugger
    modalButton.style.display = 'block'
    modalButton.addEventListener('click', () => {
      editNotesModal.style.display = 'block'
      const list = editNotesModal.querySelector('ul')
      list.innerHTML = ''
      const notes = proposal.notes
      notes.forEach(note => {
        const li = ce('li')
        const btn = ce('button')
        btn.innerText = 'Edit'
        li.innerText = note.text
        li.append(btn)
        btn.addEventListener('click', () => {
          editNoteForm[0].value = note.id
          editNoteForm[1].value = note.text
          editNoteForm.addEventListener('submit', () => {
            event.preventDefault()
            updateNote()
          })
        })
        list.append(li)
      })
    })
  }

  function loadProposal(proposal) {
    let p = new Proposal(proposal.id, proposal.title, proposal.author, proposal.description, proposal.link, proposal.notes)
    const span = p.span()
    proposalBar.append(span)
    span.addEventListener('click', () => {
      proposalContainer.style.display = 'block'
      centerProposal(p, proposalDisplay, noteList)
    })
  }

  function noteForm(proposal) {
    notesFormDiv.innerHTML = ''
    let form = ce('form')
    form.id = 'create-note'
    let textInput = ce('textarea')
    textInput.type = 'text'
    textInput.name = 'text'
    let idInput = ce('input')
    idInput.type = 'hidden'
    idInput.name = 'proposal_id'
    idInput.value = proposal.id
    let submit = ce('input')
    submit.type = 'submit'
    form.append(textInput, idInput, ce('br'), submit)
    formClick(form)
    return form
  }

  function fetchProposals() {
    fetch(proposalsURL)
      .then(res => res.json())
      .then(proposals => {
        proposals.forEach(proposal => {
          loadProposal(proposal)
        })
      })
  }

  fetchProposals()


  modalCloseButton.addEventListener('click', () => {
    editNotesModal.style.display = 'none'
  })



})