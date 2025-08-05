export interface ChatResponse {
  message: string
  suggestions?: string[]
  action?: {
    type: 'navigate' | 'show_info' | 'contact'
    data: any
  }
}

export class ChatbotService {
  private static readonly responses = {
    greeting: [
      "Hello! I'm your grievance assistant. How can I help you today?",
      "Hi there! I'm here to help with your grievance-related questions.",
      "Welcome! I can assist you with filing complaints, tracking status, and more."
    ],
    
    complaint_filing: [
      "I can help you file a new complaint! Click on 'Lodge Grievance' in your dashboard to get started. The process is simple and guided.",
      "To file a complaint, go to the 'Lodge Grievance' section. You'll need to provide details about the issue, location, and your contact information.",
      "Filing a complaint is easy! Navigate to 'Lodge Grievance' and follow the step-by-step form. I can guide you through any specific questions."
    ],
    
    status_tracking: [
      "You can track your complaint status in the dashboard. All your complaints are listed with their current status and updates.",
      "Check your dashboard for the latest status of all your complaints. Each complaint shows its current stage and any recent updates.",
      "Your complaint status is visible in the main dashboard. You can also click on individual complaints to see detailed progress."
    ],
    
    categories: [
      "We handle various categories including Water Supply, Roads & Transportation, Sanitation, Street Lighting, Public Health, Education, Public Safety, Environment, Housing, and more.",
      "Common categories include water issues, road problems, garbage collection, street lights, health concerns, and safety issues. What type of problem are you facing?",
      "We cover multiple categories: Water Supply, Roads & Transportation, Sanitation & Waste Management, Street Lighting, Public Health, Education, Public Safety, Environment, and Housing."
    ],
    
    resolution_time: [
      "Resolution times vary by category: Water supply issues (3-5 days), Road repairs (7-10 days), Garbage collection (1-2 days), Street lighting (2-3 days).",
      "Typical resolution times: Water problems (3-5 days), Road issues (7-10 days), Sanitation (1-2 days), Street lights (2-3 days), Health concerns (24-48 hours).",
      "Most issues are resolved within 3-10 days depending on complexity. Water and road issues may take longer due to infrastructure requirements."
    ],
    
    contact_info: [
      "You can contact us at 1800-GRIEVANCE or email support@grievance.gov.in. For urgent matters, call our 24/7 helpline.",
      "Contact us: Phone 1800-GRIEVANCE, Email support@grievance.gov.in, or visit our office during business hours.",
      "For support: Call 1800-GRIEVANCE, email support@grievance.gov.in, or use the contact form on our website."
    ],
    
    update_info: [
      "To update your complaint or personal information, use the 'Edit' option in your dashboard. You can modify details anytime.",
      "You can update your complaint details or personal information through the dashboard. Look for the 'Edit' button next to your complaints.",
      "Updates can be made through your dashboard. Click 'Edit' on any complaint to modify information or add new details."
    ],
    
    documents: [
      "You can upload supporting documents like photos, videos, or documents when filing a complaint. Accepted formats: PDF, DOC, JPG, PNG (max 5MB each).",
      "Supporting documents help us understand your issue better. You can upload photos, videos, or documents in PDF, DOC, JPG, or PNG format.",
      "Document upload is available when filing complaints. Accepted formats: PDF, DOC, DOCX, JPG, PNG with a maximum size of 5MB per file."
    ],
    
    emergency: [
      "For emergency situations, please call our 24/7 helpline immediately. Critical issues like water contamination or safety hazards are prioritized.",
      "Emergency issues are handled immediately. Call our 24/7 helpline for urgent problems like safety hazards or health risks.",
      "For emergencies, call our 24/7 helpline right away. Critical issues like safety problems or health hazards get immediate attention."
    ],
    
    feedback: [
      "We value your feedback! You can rate your experience after complaint resolution and provide suggestions for improvement.",
      "Your feedback helps us improve our services. After your complaint is resolved, you'll have the option to rate your experience.",
      "Feedback is important to us. You can provide ratings and suggestions after your complaint is resolved to help us serve you better."
    ]
  }

  static generateResponse(userMessage: string): ChatResponse {
    const lowerMessage = userMessage.toLowerCase()
    
    // Greeting patterns
    if (this.matchesPattern(lowerMessage, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
      return {
        message: this.getRandomResponse('greeting'),
        suggestions: ['How to file a complaint?', 'Check complaint status', 'Contact support']
      }
    }
    
    // Complaint filing patterns
    if (this.matchesPattern(lowerMessage, ['file complaint', 'lodge grievance', 'submit complaint', 'new complaint', 'how to complain'])) {
      return {
        message: this.getRandomResponse('complaint_filing'),
        suggestions: ['What documents do I need?', 'How long does it take?', 'What categories are available?'],
        action: {
          type: 'navigate',
          data: { path: '/dashboard/lodge-grievance' }
        }
      }
    }
    
    // Status tracking patterns
    if (this.matchesPattern(lowerMessage, ['status', 'track', 'progress', 'update', 'check complaint', 'where is my complaint'])) {
      return {
        message: this.getRandomResponse('status_tracking'),
        suggestions: ['How to update complaint?', 'What do status codes mean?', 'Contact about status']
      }
    }
    
    // Categories patterns
    if (this.matchesPattern(lowerMessage, ['category', 'categories', 'types', 'what problems', 'what issues'])) {
      return {
        message: this.getRandomResponse('categories'),
        suggestions: ['Water supply issues', 'Road problems', 'Garbage collection', 'Street lighting']
      }
    }
    
    // Resolution time patterns
    if (this.matchesPattern(lowerMessage, ['time', 'duration', 'how long', 'when', 'days', 'weeks', 'resolution time'])) {
      return {
        message: this.getRandomResponse('resolution_time'),
        suggestions: ['Water supply timeline', 'Road repair duration', 'Emergency response time']
      }
    }
    
    // Contact patterns
    if (this.matchesPattern(lowerMessage, ['contact', 'phone', 'email', 'call', 'support', 'help line', 'helpline'])) {
      return {
        message: this.getRandomResponse('contact_info'),
        suggestions: ['Office hours', 'Emergency contact', 'Email support']
      }
    }
    
    // Update information patterns
    if (this.matchesPattern(lowerMessage, ['update', 'change', 'modify', 'edit', 'correct'])) {
      return {
        message: this.getRandomResponse('update_info'),
        suggestions: ['Update personal details', 'Modify complaint', 'Add new information']
      }
    }
    
    // Documents patterns
    if (this.matchesPattern(lowerMessage, ['document', 'photo', 'video', 'upload', 'file', 'attachment'])) {
      return {
        message: this.getRandomResponse('documents'),
        suggestions: ['Accepted file formats', 'File size limits', 'How to upload']
      }
    }
    
    // Emergency patterns
    if (this.matchesPattern(lowerMessage, ['emergency', 'urgent', 'critical', 'dangerous', 'hazard', 'immediate'])) {
      return {
        message: this.getRandomResponse('emergency'),
        suggestions: ['24/7 helpline', 'Emergency categories', 'Priority handling'],
        action: {
          type: 'contact',
          data: { method: 'phone', number: '1800-GRIEVANCE' }
        }
      }
    }
    
    // Feedback patterns
    if (this.matchesPattern(lowerMessage, ['feedback', 'rate', 'review', 'experience', 'satisfaction'])) {
      return {
        message: this.getRandomResponse('feedback'),
        suggestions: ['Rate your experience', 'Suggest improvements', 'Report issues']
      }
    }
    
    // Help patterns
    if (this.matchesPattern(lowerMessage, ['help', 'support', 'assist', 'guide', 'what can you do'])) {
      return {
        message: "I'm here to help! I can assist you with filing complaints, tracking status, checking categories, understanding resolution times, and more. What would you like to know?",
        suggestions: ['File a complaint', 'Check status', 'Contact support', 'Learn about categories']
      }
    }
    
    // Default response
    return {
      message: "I understand you're asking about '" + userMessage + "'. I can help you with filing complaints, tracking status, checking categories, understanding resolution times, and more. Could you please rephrase your question or choose from the suggestions below?",
      suggestions: ['How to file a complaint?', 'Check complaint status', 'What categories are available?', 'Contact support']
    }
  }

  private static matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern))
  }

  private static getRandomResponse(category: keyof typeof ChatbotService.responses): string {
    const responses = this.responses[category]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  static getQuickReplies(): string[] {
    return [
      'How to file a complaint?',
      'Check my complaint status',
      'What categories are available?',
      'How long does resolution take?',
      'Contact support',
      'Update my information'
    ]
  }

  static getCategoryInfo(category: string): ChatResponse {
    const categoryInfo: Record<string, ChatResponse> = {
      'water supply': {
        message: "Water Supply issues include no water supply, low pressure, water quality problems, leakage, and tank maintenance. Typical resolution time: 3-5 days.",
        suggestions: ['File water complaint', 'Check water status', 'Emergency water issues']
      },
      'roads': {
        message: "Road & Transportation covers potholes, road construction, traffic signals, street signs, and public transport. Typical resolution time: 7-10 days.",
        suggestions: ['Report road damage', 'Traffic signal issues', 'Public transport problems']
      },
      'sanitation': {
        message: "Sanitation & Waste Management includes garbage collection, drainage issues, sewage problems, public toilets, and waste disposal. Typical resolution time: 1-2 days.",
        suggestions: ['Garbage collection', 'Drainage problems', 'Sewage issues']
      },
      'lighting': {
        message: "Street Lighting covers maintenance and installation of street lights. Typical resolution time: 2-3 days.",
        suggestions: ['Report broken lights', 'Request new lights', 'Check lighting status']
      }
    }

    return categoryInfo[category.toLowerCase()] || {
      message: "I can help you with information about various complaint categories. Which category are you interested in?",
      suggestions: ['Water Supply', 'Roads & Transportation', 'Sanitation', 'Street Lighting']
    }
  }
} 