import { useParams, Link } from 'react-router-dom';

const posts = {
  'keep-your-car-clean-in-roscommon-winter': {
    title: '5 Tips for Keeping Your Car Clean in Roscommon’s Winter',
    date: '2024-07-01',
    content: `
      <p>Winter in Roscommon can be tough on your car. Here are 5 practical tips to keep your vehicle looking its best, even in the harshest weather:</p>
      <ol>
        <li><strong>Wash regularly:</strong> Road salt and grit can damage your paint. Try to wash your car every 1-2 weeks.</li>
        <li><strong>Protect your interior:</strong> Use rubber mats to keep mud and water off your carpets.</li>
        <li><strong>Wax before winter:</strong> A good wax job helps protect your paint from the elements.</li>
        <li><strong>Keep windows clean:</strong> Dirty windows fog up faster and reduce visibility. Clean inside and out.</li>
        <li><strong>Book a professional valet:</strong> Let us do the hard work! A full valet will keep your car protected and looking great all season.</li>
      </ol>
      <p>Need help? <a href="tel:0877665058">Call Jake’s Car Care</a> for a winter valet in Roscommon or Longford!</p>
    `
  },
  'mobile-valeting-for-rural-drivers-longford': {
    title: 'Why Mobile Valeting is Perfect for Rural Drivers in Longford',
    date: '2024-07-10',
    content: `
      <p>Living in rural Longford means beautiful scenery, but it also means your car faces unique challenges: muddy roads, farm tracks, and unpredictable weather. That’s where mobile valeting comes in!</p>
      <h2>Why Choose Mobile Valeting in Longford?</h2>
      <ul>
        <li><strong>We Come to You:</strong> No need to drive to a car wash in town. We service Longford Town, Ballymahon, Edgeworthstown, Granard, and all surrounding villages.</li>
        <li><strong>Flexible Scheduling:</strong> Book a time that suits your busy rural lifestyle—at home, work, or even the farmyard.</li>
        <li><strong>Local Expertise:</strong> We know the local roads and the kind of dirt your car faces. Our products and techniques are tailored for Longford’s conditions.</li>
        <li><strong>Comprehensive Service:</strong> From mud-caked exteriors to pet hair inside, we handle it all.</li>
      </ul>
      <h2>Perfect for Rural Drivers</h2>
      <p>Whether you’re a commuter, a farmer, or just love exploring the countryside, mobile valeting keeps your car looking its best—without the hassle.</p>
      <p><strong>Ready to experience the convenience?</strong> <a href="tel:0877665058">Call Jake’s Car Care</a> for mobile valeting in Longford and nearby areas.</p>
    `
  },
  'how-often-should-you-get-your-car-detailed': {
    title: 'How Often Should You Get Your Car Detailed?',
    date: '2024-07-15',
    content: `
      <p>Keeping your car clean isn’t just about looks—it’s about protecting your investment. But how often should you get your car detailed in Roscommon or Longford?</p>
      <h2>Recommended Detailing Schedule</h2>
      <ul>
        <li><strong>Every 3-6 Months:</strong> For most drivers, a full detail every couple months is ideal. This keeps your paint, upholstery, and carpets in top condition.</li>
        <li><strong>More Often for Rural Drivers:</strong> If you drive on country roads, have pets, or kids, you may want to detail more frequently.</li>
        <li><strong>Before/After Winter:</strong> Detailing before and after winter helps remove salt, grit, and mud that can damage your car.</li>
      </ul>
      <h2>Why Regular Detailing Matters</h2>
      <ul>
        <li>Protects your paint from scratches and rust</li>
        <li>Removes allergens and bacteria from the interior</li>
        <li>Maintains your car’s value</li>
        <li>Makes driving more enjoyable!</li>
      </ul>
      <p>Not sure what’s right for you? <a href="tel:0877665058">Call Jake’s Car Care</a> for advice or to book your next detail in Roscommon or Longford.</p>
    `
  },
  'whats-included-in-a-full-valet': {
    title: 'What’s Included in a Full Valet?',
    date: '2024-07-20',
    content: `
      <p>Wondering what you get with a full car valet from Jake’s Car Care? Here’s a detailed look at what’s included for customers in Roscommon, Longford, and surrounding areas.</p>
      <h2>Exterior Services</h2>
      <ul>
        <li>Hand wash and dry</li>
        <li>Wheel cleaning and tyre shine</li>
        <li>Tar and bug removal</li>
        <li>Wax and paint protection</li>
        <li>Window and mirror cleaning</li>
      </ul>
      <h2>Interior Services</h2>
      <ul>
        <li>Full vacuum (seats, carpets, boot)</li>
        <li>Dashboard and console cleaning</li>
        <li>Leather/fabric treatment</li>
        <li>Air freshener service</li>
        <li>Stain removal (where possible)</li>
      </ul>
      <h2>Why Choose Jake’s Car Care?</h2>
      <ul>
        <li>Local, friendly service</li>
        <li>Attention to detail</li>
        <li>Flexible mobile appointments</li>
        <li>Serving Roscommon, Longford, and all nearby towns</li>
      </ul>
      <p>Ready for a showroom finish? <a href="tel:0877665058">Book your full valet today</a> with Jake’s Car Care!</p>
    `
  },
  // Add more posts here
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts[slug];
  if (!post) return <section className="py-5 bg-dark text-light w-100"><div className="container-fluid px-4"><h1>Post not found</h1><Link to="/blog" className="btn btn-outline-info mt-3">Back to Blog</Link></div></section>;
  return (
    <section className="py-5 bg-dark text-light w-100" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow" style={{
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div className="card-body p-5">
                <h1 className="display-5 fw-bold text-white mb-3" style={{
                  background: 'linear-gradient(45deg, #ff512f 0%, #dd2476 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  lineHeight: '1.3'
                }}>{post.title}</h1>
                <div className="text-info mb-4 fw-semibold" style={{
                  fontSize: '1rem',
                  opacity: 0.9
                }}>{new Date(post.date).toLocaleDateString()}</div>
                <div className="mb-4 blog-content" style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  color: '#f8f9fa',
                  textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                }} dangerouslySetInnerHTML={{ __html: post.content }} />
                <style jsx>{`
                  .blog-content h2 {
                    color: #ff512f !important;
                    font-size: 1.5rem !important;
                    font-weight: 700 !important;
                    margin-top: 2rem !important;
                    margin-bottom: 1rem !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
                  }
                  .blog-content p {
                    margin-bottom: 1.5rem !important;
                    color: #f8f9fa !important;
                  }
                  .blog-content ul, .blog-content ol {
                    margin-bottom: 1.5rem !important;
                    padding-left: 1.5rem !important;
                  }
                  .blog-content li {
                    margin-bottom: 0.5rem !important;
                    color: #f8f9fa !important;
                  }
                  .blog-content strong {
                    color: #ff512f !important;
                    font-weight: 700 !important;
                  }
                  .blog-content a {
                    color: #17a2b8 !important;
                    text-decoration: none !important;
                    font-weight: 600 !important;
                    transition: color 0.3s ease !important;
                  }
                  .blog-content a:hover {
                    color: #ff512f !important;
                    text-decoration: underline !important;
                  }
                `}</style>
                <Link to="/blog" className="btn btn-primary" style={{
                  background: 'linear-gradient(45deg, #ff512f 0%, #dd2476 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '10px 25px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(255,81,47,0.3)'
                }}>← Back to Blog</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 