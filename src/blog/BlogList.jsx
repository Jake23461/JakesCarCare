import { Link } from 'react-router-dom';

const posts = [
  {
    slug: 'keep-your-car-clean-in-roscommon-winter',
    title: '5 Tips for Keeping Your Car Clean in Roscommon\'s Winter',
    date: '2024-07-01',
    excerpt: 'Winter in Roscommon can be tough on your car. Here are 5 practical tips to keep your vehicle looking its best, even in the harshest weather.'
  },
  {
    slug: 'mobile-valeting-for-rural-drivers-longford',
    title: 'Why Mobile Valeting is Perfect for Rural Drivers in Longford',
    date: '2024-07-10',
    excerpt: 'Discover why mobile car valeting is the ideal solution for drivers in Longford\'s rural areas. Convenience, flexibility, and local expertise.'
  },
  {
    slug: 'how-often-should-you-get-your-car-detailed',
    title: 'How Often Should You Get Your Car Detailed?',
    date: '2024-07-15',
    excerpt: 'Wondering how often to book a car detail? Learn the best schedule for Roscommon and Longford drivers to keep your vehicle in top shape.'
  },
  {
    slug: 'whats-included-in-a-full-valet',
    title: 'What\'s Included in a Full Valet?',
    date: '2024-07-20',
    excerpt: 'Curious about what a full car valet covers? Here\'s a detailed breakdown of the services you get with Jake\'s Car Care in Roscommon & Longford.'
  },
];

export default function BlogList() {
  return (
    <section className="py-5 bg-dark text-light w-100" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <div className="container-fluid px-4">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary mb-3" style={{
            background: 'linear-gradient(45deg, #ff512f 0%, #dd2476 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>Blog</h1>
          <p className="lead text-light mb-0" style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>Car care tips, local advice, and more from Jake's Car Care.</p>
        </div>
        <div className="row g-4">
          {posts.map(post => (
            <div className="col-12 col-md-6 col-lg-4" key={post.slug}>
              <div className="card h-100 shadow border-0" style={{ 
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}>
                <div className="card-body d-flex flex-column p-4">
                  <h2 className="h5 text-white fw-bold mb-3" style={{ 
                    fontSize: '1.1rem',
                    lineHeight: '1.4',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>{post.title}</h2>
                  <div className="text-info small mb-3 fw-semibold" style={{ 
                    fontSize: '0.85rem',
                    opacity: 0.9
                  }}>{new Date(post.date).toLocaleDateString()}</div>
                  <p className="mb-4 text-light" style={{ 
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    opacity: 0.95,
                    textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                  }}>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="btn btn-primary mt-auto align-self-start" style={{
                    background: 'linear-gradient(45deg, #ff512f 0%, #dd2476 100%)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '8px 20px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(255,81,47,0.3)'
                  }}>Read More</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 