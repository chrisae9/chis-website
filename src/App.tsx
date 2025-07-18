// Component imports
import { SearchBar } from './components/SearchBar';
import { TagList } from './components/TagList';
import { PostContent } from './components/PostContent';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { DynamicLinks } from './components/DynamicLinks';
import { TableOfContents } from './components/TableOfContents';
import { PostList } from './components/PostList';

// Centralized configuration import
import { links } from './config';

// Hook imports
import { usePosts } from './hooks/usePosts';
import { useTheme } from './hooks/useTheme';
import { useSidebar } from './hooks/useSidebar';
import { useSectionNavigation } from './hooks/useSectionNavigation';

/**
 * Main application component that orchestrates the blog's UI and state
 * 
 * This component:
 * - Composes all the core UI components
 * - Manages application state through custom hooks
 * - Handles conditional rendering based on current view state
 * - Provides loading and error states
 * 
 * @returns React component
 */
function App() {
  // Custom hooks for different application concerns
  const { 
    filteredPosts, 
    selectedPostData, 
    searchTerm, 
    setSearchTerm,
    selectedTags,
    handleTagToggle,
    selectedCategory,
    setSelectedCategory,
    allTags,
    allCategories,
    sortOrder,
    setSortOrder,
    handlePostSelect,
    posts,
    isLoading,
    error
  } = usePosts();
  
  // Theme management (dark/light mode)
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Sidebar visibility management
  const { 
    showLeftSidebar, 
    setShowLeftSidebar, 
    showRightSidebar, 
    setShowRightSidebar 
  } = useSidebar();
  
  // Section navigation for the selected post
  const {
    sectionState,
    hasConnectedPosts,
    scrollToConnectedPosts,
    scrollToComments,
    handleSectionChange
  } = useSectionNavigation(selectedPostData || null, posts);

  // Left sidebar content - conditional based on current view
  const leftSidebarContent = selectedPostData ? (
    // When viewing a post: Show table of contents
    <Sidebar
      title="Table of Contents"
      showMobileHeader={true}
    >
      <div className="sticky-toc">
        <TableOfContents 
          content={selectedPostData.content} 
          hasConnectedPosts={hasConnectedPosts}
          onConnectedPostsClick={scrollToConnectedPosts}
          onCommentsClick={scrollToComments}
          isConnectedPostsActive={sectionState.connected}
          isCommentsActive={sectionState.comments}
          onHeadingClick={() => handleSectionChange({ connected: false, comments: false })}
        />
      </div>
    </Sidebar>
  ) : (
    // When viewing post list: Show tag filter
    <Sidebar
      title="Tags"
      showMobileHeader={true}
    >
      <TagList
        tags={allTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />
    </Sidebar>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Content</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            aria-label="Reload page"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main application layout
  return (
    <Layout
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
      showLeftSidebar={showLeftSidebar}
      showRightSidebar={showRightSidebar}
      setShowLeftSidebar={setShowLeftSidebar}
      setShowRightSidebar={setShowRightSidebar}
      header={
        !selectedPostData ? (
          // Search bar when viewing post list
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        ) : null
      }
      leftSidebar={leftSidebarContent}
      rightSidebar={
        <Sidebar
          title="Links"
          showMobileHeader={true}
        >
          <div className="space-y-3">
            <DynamicLinks links={links} />
          </div>
        </Sidebar>
      }
      isPostView={!!selectedPostData}
    >
      {/* Main content area - conditionally render post content or post list */}
      {selectedPostData ? (
        <PostContent
          post={selectedPostData}
          onBack={() => handlePostSelect(null)}
          darkMode={darkMode}
          onPostClick={handlePostSelect}
          allPosts={posts}
          isConnectedPostsActive={sectionState.connected}
          isCommentsActive={sectionState.comments}
        />
      ) : (
        <PostList
          posts={filteredPosts}
          searchTerm={searchTerm}
          onPostClick={handlePostSelect}
          categories={allCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      )}
    </Layout>
  );
}

export default App;
