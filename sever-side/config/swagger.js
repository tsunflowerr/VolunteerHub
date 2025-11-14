import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VolunteerHub API Documentation',
      version: '1.0.0',
      description: 'API documentation for VolunteerHub - A volunteer management platform',
      contact: {
        name: 'VolunteerHub Team',
        email: 'tot23032@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:4000/api',
        description: 'Development API server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['user', 'manager', 'admin'],
              description: 'User role'
            },
            phone_number: {
              type: 'string',
              description: 'User phone number'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Event ID'
            },
            title: {
              type: 'string',
              description: 'Event title'
            },
            description: {
              type: 'string',
              description: 'Event description'
            },
            location: {
              type: 'string',
              description: 'Event location'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Event date'
            },
            category: {
              type: 'string',
              description: 'Category ID'
            },
            maxVolunteers: {
              type: 'number',
              description: 'Maximum number of volunteers'
            },
            currentVolunteers: {
              type: 'number',
              description: 'Current number of registered volunteers'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
              description: 'Event status'
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the event'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Category ID'
            },
            name: {
              type: 'string',
              description: 'Category name'
            },
            description: {
              type: 'string',
              description: 'Category description'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Post ID'
            },
            title: {
              type: 'string',
              description: 'Post title'
            },
            content: {
              type: 'string',
              description: 'Post content'
            },
            author: {
              type: 'string',
              description: 'User ID of the author'
            },
            event: {
              type: 'string',
              description: 'Event ID related to the post'
            },
            likesCount: {
              type: 'number',
              description: 'Number of likes'
            },
            commentsCount: {
              type: 'number',
              description: 'Number of comments'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Registration: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Registration ID'
            },
            user: {
              type: 'string',
              description: 'User ID'
            },
            event: {
              type: 'string',
              description: 'Event ID'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
              description: 'Registration status'
            },
            registeredAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Notification ID'
            },
            sender: {
              type: 'string',
              description: 'Sender User ID'
            },
            recipient: {
              type: 'string',
              description: 'Recipient User ID'
            },
            type: {
              type: 'string',
              enum: ['like', 'comment', 'comment_reply', 'new_post', 'event_status_update', 'registration_status_update'],
              description: 'Notification type'
            },
            relatedStatus: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'confirmed'],
              description: 'Related status for status update notifications'
            },
            post: {
              type: 'string',
              description: 'Related Post ID (optional)'
            },
            event: {
              type: 'string',
              description: 'Related Event ID (optional)'
            },
            content: {
              type: 'string',
              description: 'Notification message content'
            },
            isRead: {
              type: 'boolean',
              description: 'Whether the notification has been read'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Events',
        description: 'Event management endpoints'
      },
      {
        name: 'Categories',
        description: 'Category management endpoints'
      },
      {
        name: 'Registrations',
        description: 'Event registration endpoints'
      },
      {
        name: 'Posts',
        description: 'Post management endpoints'
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and statistics endpoints'
      },
      {
        name: 'Search',
        description: 'Search endpoints'
      },
      {
        name: 'Admin',
        description: 'Admin management endpoints'
      },
      {
        name: 'Manager',
        description: 'Manager management endpoints'
      },
      {
        name: 'Notifications',
        description: 'Notification management endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controller/**/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
