export default function FAQ() {
  return (
    <section className="py-5 bg-dark w-100">
      <div className="container-fluid px-4">
        <h2 className="display-6 fw-bold text-primary text-center mb-4">Frequently Asked Questions</h2>
        <div className="accordion" id="faqAccordion">
          <div className="accordion-item bg-secondary">
            <h2 className="accordion-header" id="faq1">
              <button className="accordion-button bg-secondary text-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                How long does a full valet take?
              </button>
            </h2>
            <div id="collapse1" className="accordion-collapse collapse show" aria-labelledby="faq1" data-bs-parent="#faqAccordion">
              <div className="accordion-body text-light">
                A full valet typically takes 3-4 hours depending on the vehicle size and condition.
              </div>
            </div>
          </div>
          <div className="accordion-item bg-secondary">
            <h2 className="accordion-header" id="faq2">
              <button className="accordion-button collapsed bg-secondary text-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                Do you offer mobile valeting?
              </button>
            </h2>
            <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="faq2" data-bs-parent="#faqAccordion">
              <div className="accordion-body text-light">
                Yes! We come to your home or workplace for your convenience, all we need is an outlet and a hose tap!.
              </div>
            </div>
          </div>
          <div className="accordion-item bg-secondary">
            <h2 className="accordion-header" id="faq3">
              <button className="accordion-button collapsed bg-secondary text-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                What payment methods do you accept?
              </button>
            </h2>
            <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="faq3" data-bs-parent="#faqAccordion">
              <div className="accordion-body text-light">
                We accept cash Revolut payments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 