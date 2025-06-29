# 🚀 Reading Tracker Social Integration

**AI-Powered Content Tracking with Social Features**

This project integrates a Chrome extension that tracks your reading habits with a social website where you can share and discover content from other users.

## 🎯 What This Does

- **📖 Automatic Content Tracking**: Extension detects articles, blogs, and videos you read
- **🤖 Local AI Processing**: Summarizes and rates content quality using local LLM
- **🌐 Social Sharing**: Syncs your reading activity to a social website
- **👥 Follow System**: Follow other users to see their reading recommendations
- **🔒 Privacy-First**: All AI processing happens locally on your machine

## 🏗️ Architecture

```
Browser Content → Chrome Extension → Local LLM → Social Website → User Profiles
```

### Components

1. **Chrome Extension** (`reading-tracker-extension-main/`)
   - Content detection and extraction
   - Local LLM integration for AI processing
   - Website sync functionality
   - Authentication management

2. **Social Website** (`website-2/`)
   - User profiles and authentication
   - Content sharing and following system
   - API for extension integration
   - Web interface for browsing shared content

3. **Local LLM Server** (`reading-tracker-extension-main/llm-server/`)
   - Privacy-first AI processing
   - Content summarization
   - Quality assessment

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (for LLM server)
- **MongoDB** (local or cloud)
- **Chrome Browser**

### 1-Command Setup
```bash
cd "/home/deekshith/Downloads/GDSC PROJECT"
./quick-start.sh
```

### Manual Setup
```bash
# 1. Install MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb

# 2. Setup environment
cd website-2
cp .env.example .env
# Edit .env and change JWT_SECRET

# 3. Install dependencies
npm install

# 4. Start website
npm start

# 5. Load Chrome extension
# Chrome → chrome://extensions/ → Load unpacked → Select reading-tracker-extension-main
```

## 📊 Features

### For Users
- ✅ **Automatic Tracking**: No manual input needed
- ✅ **Smart Summaries**: AI-generated content summaries
- ✅ **Quality Scoring**: See which content is worth your time
- ✅ **Social Discovery**: Find great content from people you follow
- ✅ **Privacy Protected**: Your data stays local unless you choose to share

### For Developers
- ✅ **Modular Architecture**: Easy to extend and modify
- ✅ **Local AI Processing**: No external API dependencies
- ✅ **RESTful API**: Clean integration between components
- ✅ **Authentication**: Secure JWT-based auth system
- ✅ **Cross-Origin Support**: Proper CORS configuration

## 🔧 Configuration

### Environment Variables (website-2/.env)
```env
MONGODB_URI=mongodb://localhost:27017/reading-tracker-social
JWT_SECRET=your-secure-secret-key
PORT=3001
NODE_ENV=development

# Optional: AI API keys for better summaries
OPENAI_API_KEY=your-openai-key
COHERE_API_KEY=your-cohere-key
```

### Extension Permissions (manifest.json)
- `activeTab` - Read current page content
- `storage` - Save user preferences and content
- `tabs` - Track navigation
- `http://localhost:3001/*` - Sync with website

## 🔄 Data Flow

1. **Content Detection**: Extension detects when you read an article
2. **Local Processing**: Content is processed by local LLM for quality and summary
3. **Authentication**: Extension authenticates with website using JWT tokens
4. **Sync**: Enhanced content (summary, quality score) syncs to website
5. **Social Sharing**: Content appears in your profile for followers to see
6. **Discovery**: You can browse content shared by users you follow

## 🛡️ Privacy & Security

- **Local AI**: All content analysis happens on your machine
- **Selective Sharing**: Only summaries and metadata are shared, not full content
- **Secure Auth**: JWT tokens with configurable expiration
- **CORS Protection**: Website only accepts requests from authorized origins
- **Optional Sync**: Can disable website sync and use extension offline

## 📁 Project Structure

```
GDSC PROJECT/
├── reading-tracker-extension-main/    # Chrome Extension
│   ├── manifest.json                  # Extension configuration
│   ├── popup.html/js                  # User interface
│   ├── background.js                  # Main extension logic
│   ├── content.js                     # Page content extraction
│   └── llm-server/                    # Local AI server
│       └── llm_server.py              # Python LLM server
├── website-2/                         # Social Website
│   ├── server.js                      # Express.js server
│   ├── routes/                        # API endpoints
│   ├── models/                        # Database models
│   ├── frontend/                      # React frontend
│   └── .env                          # Environment configuration
└── Setup Scripts/
    ├── quick-start.sh                 # Automated setup
    ├── setup-mongodb.sh               # Database setup
    └── Documentation files
```

## 🧪 Testing

### Basic Integration Test
1. Load extension in Chrome
2. Register account on website (http://localhost:3001)
3. Login through extension popup
4. Visit a news article or blog
5. Check extension popup for tracked content
6. Check website profile for synced content
7. Follow another user and see their content

### Advanced Testing
- Test with LLM server for AI summaries
- Test offline mode (extension without website sync)
- Test authentication flows (login/logout)
- Test content filtering and search
- Test social features (following, profiles)

## 🆘 Troubleshooting

### Common Issues

**Extension won't load**
- Check file permissions: `chmod -R 755 reading-tracker-extension-main`
- Verify manifest.json is valid JSON

**Website won't start**
- Check MongoDB is running: `sudo systemctl status mongodb`
- Check port 3001 is free: `sudo lsof -i :3001`
- Verify .env file exists and JWT_SECRET is set

**Authentication fails**
- Check CORS settings in server.js
- Verify extension has localhost:3001 permission
- Check browser console for errors

**Content not syncing**
- Verify you're logged in through extension
- Check network tab for API call errors
- Ensure website API is responding

### Debug Mode
- Extension: Right-click popup → Inspect
- Background: chrome://extensions/ → Inspect views: background page
- Website: Browser dev tools → Console/Network tabs

## 🔮 Future Enhancements

- **Mobile App**: React Native app for mobile access
- **Browser Support**: Firefox and Safari extensions
- **Advanced AI**: Better categorization and recommendations
- **Export Features**: Export reading data in various formats
- **Reading Goals**: Set and track reading targets
- **Team Features**: Share content within teams or groups

## 🤝 Contributing

This project is designed to be easily extensible:

1. **Extension Features**: Add new content detection or AI processing
2. **Website Features**: Add new social features or UI improvements
3. **AI Models**: Integrate different LLM models or providers
4. **Integrations**: Connect with other reading platforms or services

## 📄 License

This project is for educational and personal use. See individual component licenses for more details.

## 🎉 Success!

You now have a complete AI-powered reading tracker with social features! The extension will help you discover quality content while building a social network around shared reading interests.

**Happy Reading!** 📚✨
