# Speed Fix - GitHub API Optimization

## Problem
Analysis was taking 60+ seconds stuck on "Fetching GitHub profile..."

## Root Cause
- **Too many API calls**: Each repo was making 6-7 separate API calls
- **Sequential blocking**: GitHub API calls were blocking the async event loop
- **Unnecessary checks**: Checking commit activity and too many repos

## Solutions Applied

### 1. **Batched API Calls** (95% reduction)
- **Before**: 30 repos × 7 API calls = **210 API calls**
- **After**: 5 repos × 2 API calls = **10 API calls**
- **How**: Created `_detect_repo_features()` that gets repo contents ONCE and checks everything from that

### 2. **Reduced Repo Processing**
- **Before**: Checked top 30 repos in detail
- **After**: 
  - Top 10 repos total
  - Only top 5 original (non-fork) repos get detailed checks
  - Forks skip all detailed API calls

### 3. **Removed Slow Operations**
- **Commit activity**: Completely removed (was slow and not critical)
- **Excessive README fetching**: Only fetch 3 READMEs max

### 4. **Async Optimization**
- GitHub fetch now runs in thread pool executor (doesn't block)
- Added 15-second timeout to prevent hanging
- Better error messages

### 5. **Added Logging**
- Logs show progress: "Fetching repository list...", "Processing top X repos..."
- Helps debug if still slow

## Expected Performance

**Before**: 60+ seconds (often timeout)
**After**: 5-10 seconds for GitHub fetch

## API Call Breakdown

### Before (per profile):
- User profile: 1 call
- List repos: 1 call  
- 30 repos × (README + tests + dockerfile + CI + API folder + DB + notebooks): ~210 calls
- Commit activity: ~50 calls
- **Total: ~262 API calls**

### After (per profile):
- User profile: 1 call
- List repos: 1 call
- 5 repos × (README + contents batch): ~10 calls
- **Total: ~12 API calls**

**98% reduction in API calls!**

## Testing

Restart backend and test:
```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

Check backend logs - you should see:
```
INFO: Fetching GitHub profile for username...
INFO: Fetching repository list...
INFO: Processing top 10 repos (out of X total)
INFO: Profile fetch complete: 10 repos processed
```

If still slow, check:
1. GitHub token is valid (no 401 errors)
2. Network connection
3. Backend logs for specific errors
