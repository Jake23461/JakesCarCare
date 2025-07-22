# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Car Valeting Website

A modern, responsive website for a car valeting business built with React and Bootstrap.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with red and black theme
- **Interactive Gallery**: 
  - Lightbox effect for images
  - Before/After transformations
  - **Video Support**: Play videos in lightbox modal
  - Categorized content (Before & After, Interiors, Exteriors, Videos)
- **Booking System**: Easy online booking with calendar integration
- **Contact Form**: Professional contact form with validation
- **Admin Panel**: Manage bookings and content
- **Testimonials**: Customer reviews and ratings
- **FAQ Section**: Common questions and answers

## Gallery Features

### Adding Images
1. Place image files in `public/gallery/` folder
2. Add entries to the `galleryCategories` array in `src/components/Gallery.jsx`
3. Support for single images, before/after pairs, and videos

### Adding Videos
1. Place video files in `public/gallery/` folder (MP4 format recommended)
2. Add a poster image (thumbnail) for the video
3. Add video entries to the videos category:

```javascript
{
  id: 7,
  src: '/gallery/your-video.mp4',
  poster: '/gallery/video-poster.jpg',
  label: 'Video Title',
  description: 'Video description',
  duration: '2:30'
}
```

### Video Features
- **Play Button Overlay**: Click the play button to open video in lightbox
- **Duration Badge**: Shows video length
- **Auto-play**: Videos start automatically when opened
- **Full Controls**: Play, pause, volume, fullscreen controls
- **Responsive**: Videos adapt to screen size

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## File Structure

```
src/
├── components/
│   ├── Gallery.jsx          # Gallery with image/video support
│   ├── BookingModal.jsx     # Booking system
│   ├── Admin.jsx           # Admin panel
│   └── ...                 # Other components
├── App.jsx                 # Main app component
└── main.jsx               # App entry point

public/
└── gallery/               # Image and video files
    ├── car1.jpeg
    ├── Interior.png
    ├── your-video.mp4     # Add your videos here
    └── video-poster.jpg   # Video thumbnails
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Bootstrap 5**: Responsive CSS framework
- **Vite**: Fast build tool
- **Firebase**: Backend services (optional)

## Customization

- **Colors**: Modify CSS variables in `src/App.css`
- **Content**: Update text and images in component files
- **Gallery**: Add/remove images and videos in `Gallery.jsx`
- **Services**: Modify service offerings in `Services.jsx`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available under the [MIT License](LICENSE).
