import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';

function App() {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [show, setShow] = useState(false);
  const [questions, setQuestions] = useState([
    {
      title: '',
      answers: [{
        text: '',
        error: ''
      }, {
        text: '',
        error: ''
      }],
      error: ''
    }
  ]);

  const [modalBody, setModalBody] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const resetState = () => {
    setTitle('');
    setTitleError('');
    setDeadline(new Date());
    setQuestions([
      {
        title: '',
        answers: [{
          text: '',
          error: ''
        }, {
          text: '',
          error: ''
        }],
        error: ''
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let foundError = false;

    if (title === '') {
      setTitleError('Title field is required');
      foundError = true;
    } else {
      setTitleError('');
    }

    questions.forEach(question => {
      if (question.title === '') {
        question.error = 'Question field is required';
        foundError = true;
      } else {
        question.error = '';
      }

      question.answers.forEach((answer, answerIndex) => {
        if (answer.text === '' && answerIndex < 2) {
          answer.error = 'This answer field is required';
          foundError = true;
        } else {
          answer.error = '';
        }
      });
    });

    if (foundError === false) {
      let reqQuestions = [];
      questions.forEach(question => {
        let answers = [];

        question.answers.forEach(answer => {
          if (answer.text !== '') {
            answers.push(answer.text);
          }
        });

        reqQuestions.push({
          title: question.title,
          answers: answers
        });
      });

      let reqBody = { title: title, deadline: deadline, questions: reqQuestions };

      fetch('http://projectest.xyz/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      }).then(res => res.json())
        .then(data => {
          setModalBody(data.message);
          handleShow();
          resetState();
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      setQuestions([...questions]);
    }
  };

  return (
    <div className='container'>
      <h1 className='text-center mb-4'>Questionnaire</h1>

      <form onSubmit={handleSubmit}>
        <div className='row'>
          <div className='col-md-6 mx-auto'>
            <label htmlFor='questionnaireTitle' className='form-label'>Title</label>
            <input id='questionnaireTitle'
              type="text"
              className='form-control'
              value={title}
              onChange={(e) => {
                let newTitle = e.target.value;
                setTitle(newTitle);
              }} />
            <div className="error">{titleError}</div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6 mx-auto'>
            <label htmlFor='questionnaireDeadline' className='form-label'>Deadline</label>
            <DatePicker
              className='form-control'
              selected={deadline}
              minDate={new Date()}
              onChange={(date) => setDeadline(date)} />
          </div>
        </div>

        {
          questions.map((question, questionIndex) => (
            <div key={`question${questionIndex + 1}`}>
              <div className='row'>
                <div className='col-md-6 mx-auto'>
                  <label htmlFor={`question${questionIndex + 1}`} className='form-label'>Question {questionIndex + 1}</label>
                  <input id={`question${questionIndex + 1}`}
                    type="text"
                    className='form-control'
                    value={question.title}
                    onChange={(e) => {
                      question.title = e.target.value;
                      setQuestions([...questions]);
                    }} />
                  <div className="error">{question.error}</div>
                </div>
              </div>

              {
                question.answers.map((answer, answerIndex) => (
                  <div className='row' key={`answer${answerIndex + 1}`}>
                    <div className="col-md-5 mx-auto">
                      <label htmlFor={`question${questionIndex + 1}answer${answerIndex + 1}`} className='form-label'>Answer {answerIndex + 1}</label>
                      <input id={`question${questionIndex + 1}answer${answerIndex + 1}`}
                        type="text"
                        className='form-control'
                        value={answer.text}
                        onChange={(e) => {
                          answer.text = e.target.value;
                          setQuestions([...questions]);
                        }} />
                      <div className="error">{answer.error}</div>
                    </div>
                  </div>
                ))
              }

              {
                question.answers.length < 5 &&
                <div className='row'>
                  <div className="col-md-5 mx-auto mb-2">
                    <button
                      className='btn btn-secondary'
                      onClick={(e) => {
                        e.preventDefault();

                        question.answers.push({ text: '', error: '' });
                        setQuestions([...questions]);
                      }}>
                      New Answer
                    </button>
                  </div>
                </div>
              }

              <div className='row'>
                <div className="col-md-6 mx-auto mb-2">
                  <button
                    className='btn btn-primary'
                    onClick={(e) => {
                      e.preventDefault();

                      questions.splice(questionIndex, 0, JSON.parse(JSON.stringify(questions[questionIndex])));
                      setQuestions([...questions]);
                    }}>
                    Copy Question
                  </button>
                </div>
              </div>
            </div>
          ))
        }

        <div className='row'>
          <div className="col-md-6 mx-auto mb-2">
            <div className='justify-content-end d-flex'>
              <button
                className='btn btn-dark'
                onClick={(e) => {
                  e.preventDefault();

                  questions.push({
                    title: '',
                    answers: [{
                      text: '',
                      error: ''
                    }, {
                      text: '',
                      error: ''
                    }],
                    error: ''
                  });
                  setQuestions([...questions]);
                }}>
                New Question
              </button>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className="col-md-6 mx-auto mb-4">
            <div className='justify-content-center d-flex'>
              <button
                className='btn btn-success'
                type='submit'>
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        isOpen={show}
        ariaHideApp={false}
        style={{
          content: {
            border: 0
          }
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Message</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <p>{modalBody}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
