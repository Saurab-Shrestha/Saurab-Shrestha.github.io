import React, { useState, useId } from 'react';
import CopyEmail from '../../components/CopyEmail';
import { appConfig } from '../../../config/app.config';

type Status = 'idle' | 'sending' | 'success' | 'error';

interface FormValues {
  name: string;
  email: string;
  message: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.message.trim()) errors.message = 'Message is required.';
  else if (values.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  return errors;
}

const ContactSection: React.FC = () => {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const nameErrId = useId();
  const emailErrId = useId();
  const messageErrId = useId();

  const [values, setValues] = useState<FormValues>({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({ name: false, email: false, message: false });
  const [status, setStatus] = useState<Status>('idle');

  const errors = validate(values);
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) return;

    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          subject: `Portfolio contact from ${values.name.trim()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setValues({ name: '', email: '', message: '' });
        setTouched({ name: false, email: false, message: false });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const showError = (field: keyof FormValues) => touched[field] && errors[field];

  return (
    <>
      <div className="section-divider"></div>

      <section id="contact">
        <div className="grid-lines contact-grid-lines" aria-hidden="true" />
        <div className="contact-inner">

          <div className="contact-left reveal">
            <div className="section-label">
              <span className="num">05</span> Contact
            </div>
            <h2>Let's build<br /><em>something.</em></h2>
            <p>A project idea, a collaboration, or just a chat about technology — I'd love to hear from you.</p>
            <CopyEmail email={appConfig.contact.email} />

            <div className="contact-links">
              <a href={`mailto:${appConfig.contact.email}`} className="contact-link-row">
                <span className="contact-link-label">Email</span>
                <span className="contact-link-value">{appConfig.contact.email}</span>
              </a>
              <div className="contact-link-row">
                <span className="contact-link-label">Location</span>
                <span className="contact-link-value">Bhaktapur, Nepal — open to remote</span>
              </div>
              <a href="https://github.com/Saurab-Shrestha" target="_blank" rel="noreferrer" className="contact-link-row">
                <span className="contact-link-label">GitHub</span>
                <span className="contact-link-value">github.com/Saurab-Shrestha</span>
              </a>
            </div>
          </div>

          <div className="reveal">
            {status === 'success' ? (
              <div className="contact-success" role="alert">
                <div className="contact-success-icon" aria-hidden="true">✓</div>
                <h3 className="contact-success-title">Message sent.</h3>
                <p className="contact-success-body">Thanks for reaching out. I'll get back to you within 24 hours.</p>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ marginTop: '24px' }}
                  onClick={() => setStatus('idle')}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
              >
                <div className="form-row">
                  <div className="field">
                    <label htmlFor={nameId}>Name</label>
                    <input
                      id={nameId}
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Your name"
                      maxLength={100}
                      required
                      aria-required="true"
                      aria-invalid={showError('name') ? 'true' : undefined}
                      aria-describedby={showError('name') ? nameErrId : undefined}
                      className={showError('name') ? 'field-error' : ''}
                    />
                    {showError('name') && (
                      <span id={nameErrId} className="field-error-msg" role="alert">{errors.name}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor={emailId}>Email</label>
                    <input
                      id={emailId}
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="your@email.com"
                      maxLength={254}
                      required
                      aria-required="true"
                      aria-invalid={showError('email') ? 'true' : undefined}
                      aria-describedby={showError('email') ? emailErrId : undefined}
                      className={showError('email') ? 'field-error' : ''}
                    />
                    {showError('email') && (
                      <span id={emailErrId} className="field-error-msg" role="alert">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor={messageId}>Message</label>
                  <textarea
                    id={messageId}
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Tell me about your project or just say hello."
                    maxLength={2000}
                    required
                    aria-required="true"
                    aria-invalid={showError('message') ? 'true' : undefined}
                    aria-describedby={showError('message') ? messageErrId : undefined}
                    className={showError('message') ? 'field-error' : ''}
                  />
                  {showError('message') && (
                    <span id={messageErrId} className="field-error-msg" role="alert">{errors.message}</span>
                  )}
                </div>

                {status === 'error' && (
                  <div className="form-error-banner" role="alert">
                    Something went wrong sending your message. Try again, or email me directly.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={status === 'sending'}
                    aria-disabled={status === 'sending'}
                    style={{ flex: 1, border: 'none', cursor: status === 'sending' ? 'wait' : 'none', opacity: status === 'sending' ? 0.7 : 1 }}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send Message'}
                  </button>
                  <a
                    href={`mailto:${appConfig.contact.email}`}
                    className="btn-ghost"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    Email Directly
                  </a>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default ContactSection;
