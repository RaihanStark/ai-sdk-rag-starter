'use client';

import { useChat } from '@ai-sdk/react';
import { ChartArtifact } from '@/components/chart-artifact';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  // Helper function to extract chart artifacts from tool invocations
  const extractChartArtifact = (toolInvocations: any[]) => {
    if (!toolInvocations) return null;
    
    for (const invocation of toolInvocations) {
      if (invocation.toolName === 'generateChart' && invocation.result?.artifact?.type === 'chart') {
        return invocation.result.artifact;
      }
    }
    return null;
  };
  
  return (
    <div className="flex flex-col w-full max-w-4xl py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => {
          const chartArtifact = extractChartArtifact(m.toolInvocations);
          
          return (
            <div key={m.id} className="whitespace-pre-wrap">
              <div>
                <div className="font-bold">{m.role}</div>
                {chartArtifact ? (
                  <div className="mt-4">
                    <ChartArtifact
                      type={chartArtifact.chartType}
                      title={chartArtifact.title}
                      data={chartArtifact.data}
                      xAxisLabel={chartArtifact.xAxisLabel}
                      yAxisLabel={chartArtifact.yAxisLabel}
                      colorScheme={chartArtifact.colorScheme}
                    />
                  </div>
                ) : (
                  <p>
                    {m.content.length > 0 ? (
                      m.content
                    ) : (
                      <span className="italic font-light">
                        {'calling tool: ' + m?.toolInvocations?.[0].toolName}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-4xl p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}