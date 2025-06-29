#!/bin/bash

# Reading Tracker - Quick Start Setup
echo "🚀 Reading Tracker Integration - Quick Start"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check current directory
CURRENT_DIR="/home/deekshith/Downloads/GDSC PROJECT"
cd "$CURRENT_DIR"

echo -e "${BLUE}📍 Current directory: $CURRENT_DIR${NC}"
echo ""

# Function to show menu
show_menu() {
    echo -e "${BLUE}Choose your setup option:${NC}"
    echo "1. 🍃 Install MongoDB locally (recommended)"
    echo "2. 🌐 Use MongoDB Atlas (cloud - requires internet)"
    echo "3. 🧪 Test without database (basic mode)"
    echo "4. 📖 Show detailed setup guide"
    echo "5. ❌ Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
}

# Function to install MongoDB locally
install_mongodb() {
    echo -e "${BLUE}📦 Installing MongoDB locally...${NC}"
    
    # Update package list
    sudo apt update
    
    # Install MongoDB
    sudo apt install -y mongodb
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ MongoDB installed successfully${NC}"
        
        # Start MongoDB
        sudo systemctl start mongodb
        sudo systemctl enable mongodb
        
        # Check if it's running
        if sudo systemctl is-active --quiet mongodb; then
            echo -e "${GREEN}✅ MongoDB is running${NC}"
        else
            echo -e "${YELLOW}⚠️  Starting MongoDB...${NC}"
            sudo systemctl start mongodb
        fi
        
        # Update .env file
        sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/reading-tracker-social|' website-2/.env
        
        echo -e "${GREEN}✅ MongoDB setup complete!${NC}"
        return 0
    else
        echo -e "${RED}❌ MongoDB installation failed${NC}"
        return 1
    fi
}

# Function to setup Atlas
setup_atlas() {
    echo -e "${BLUE}🌐 MongoDB Atlas Setup${NC}"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://www.mongodb.com/atlas"
    echo "2. Create a free account"
    echo "3. Create a new cluster (choose FREE tier)"
    echo "4. Create a database user"
    echo "5. Get your connection string"
    echo ""
    echo "Your connection string will look like:"
    echo "mongodb+srv://username:password@cluster.mongodb.net/reading-tracker-social"
    echo ""
    read -p "Enter your MongoDB Atlas connection string: " atlas_uri
    
    if [ ! -z "$atlas_uri" ]; then
        # Update .env file
        sed -i "s|MONGODB_URI=.*|MONGODB_URI=$atlas_uri|" website-2/.env
        echo -e "${GREEN}✅ MongoDB Atlas configured!${NC}"
        return 0
    else
        echo -e "${RED}❌ No connection string provided${NC}"
        return 1
    fi
}

# Function to test without database
test_mode() {
    echo -e "${YELLOW}🧪 Testing in basic mode (no database)${NC}"
    echo "Note: Some features will be limited without a database"
    
    # Set to a dummy URI that won't connect
    sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/reading-tracker-test|' website-2/.env
    
    echo -e "${YELLOW}⚠️  Database disabled for testing${NC}"
    return 0
}

# Function to show detailed guide
show_guide() {
    echo -e "${BLUE}📖 Opening detailed setup guide...${NC}"
    if command -v less &> /dev/null; then
        less FINAL-SETUP-GUIDE.md
    elif command -v more &> /dev/null; then
        more FINAL-SETUP-GUIDE.md
    else
        cat FINAL-SETUP-GUIDE.md
    fi
}

# Function to start services
start_services() {
    echo ""
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    # Start website
    echo -e "${BLUE}Starting website server...${NC}"
    cd website-2
    npm start &
    WEBSITE_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Website started (PID: $WEBSITE_PID)${NC}"
    echo -e "${BLUE}🌐 Website running at: http://localhost:3001${NC}"
    
    # Check if LLM server exists
    if [ -f "reading-tracker-extension-main/llm-server/llm_server.py" ]; then
        echo -e "${BLUE}Starting LLM server...${NC}"
        cd reading-tracker-extension-main/llm-server
        python llm_server.py &
        LLM_PID=$!
        cd ../..
        echo -e "${GREEN}✅ LLM server started (PID: $LLM_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  LLM server not found (extension will work in basic mode)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Services are running!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Open Chrome → chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked'"
    echo "4. Select: reading-tracker-extension-main"
    echo "5. Go to http://localhost:3001 and create account"
    echo "6. Login through extension popup"
    echo "7. Visit web pages to test tracking"
    echo ""
    echo -e "${RED}Press Ctrl+C to stop all services${NC}"
    
    wait
}

# Main execution
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo -e "${GREEN}✅ Environment file configured${NC}"
echo ""

# Show menu and handle choice
while true; do
    show_menu
    
    case $choice in
        1)
            if install_mongodb; then
                start_services
                break
            fi
            ;;
        2)
            if setup_atlas; then
                start_services
                break
            fi
            ;;
        3)
            test_mode
            start_services
            break
            ;;
        4)
            show_guide
            ;;
        5)
            echo -e "${BLUE}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please select 1-5.${NC}"
            echo ""
            ;;
    esac
done
