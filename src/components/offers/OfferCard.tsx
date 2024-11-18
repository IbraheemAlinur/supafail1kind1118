import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Tag, Clock, AlertCircle, Send, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { useStore } from '../../store/useStore';
import { useKiPoints } from '../../hooks/useKiPoints';
import OfferDetailsModal from './OfferDetailsModal';
import OfferResponseModal from './OfferResponseModal';

interface OfferCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  kiPoints: number;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
  responseCount: number;
  createdAt: Date;
  status: 'open' | 'in_progress' | 'completed';
  isInterested?: boolean;
  onInterest?: () => void;
  responses?: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: Date;
  }>;
}

export default function OfferCard({
  id,
  title,
  description,
  tags,
  kiPoints,
  author,
  responseCount,
  createdAt,
  status,
  isInterested,
  onInterest,
  responses = []
}: OfferCardProps) {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const { transferPoints } = useKiPoints();
  const [error, setError] = useState<string | null>(null);

  const handleAcceptResponse = async (responseId: string, responderId: string) => {
    try {
      await transferPoints(
        author.id, // recipient (offer creator)
        kiPoints,
        `Payment for offer: ${title}`,
        {
          offerId: id,
          responseId,
          type: 'offer_payment'
        }
      );

      // Here you would also update the offer status and response status in your database
      // This would typically be handled by a separate function in your Firebase service
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    }
  };

  const handleRejectResponse = async (responseId: string) => {
    // Implement rejection logic - update response status in database
  };

  const isAuthor = user?.id === author.id;
  const hasAcceptedResponse = responses.some(r => r.status === 'accepted');

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">{author.name}</p>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'completed' ? 'bg-green-100 text-green-800' :
              status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Offer
            </span>
          </div>
        </div>

        <p className="mt-4 text-gray-600">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
              <Tag className="h-4 w-4 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {responseCount} {responseCount === 1 ? 'response' : 'responses'}
            </button>
            {!isAuthor && status === 'open' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInterest?.();
                }}
                className={`inline-flex items-center text-sm ${
                  isInterested
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${isInterested ? 'fill-current' : ''}`} />
                {isInterested ? 'Interested' : 'Show Interest'}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {kiPoints} Ki
            </span>
            {!isAuthor && status === 'open' && !hasAcceptedResponse && (
              <button
                onClick={() => setShowResponseModal(true)}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Respond
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isAuthor && responses.length > 0 && (
          <div className="mt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Responses</h4>
            {responses.map((response) => (
              <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={response.userAvatar} alt={response.userName} className="h-8 w-8 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{response.userName}</p>
                    <p className="text-sm text-gray-500">{response.message}</p>
                  </div>
                </div>
                {response.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptResponse(response.id, response.userId)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectResponse(response.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
                {response.status !== 'pending' && (
                  <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                    response.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <OfferDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        offer={{
          id,
          title,
          description,
          kiPoints,
          author,
          tags,
          createdAt,
          status,
          responses
        }}
      />

      <OfferResponseModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        offerId={id}
        offerTitle={title}
        kiPoints={kiPoints}
      />
    </>
  );
}