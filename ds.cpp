#include <bits/stdc++.h>
using namespace std;
 
typedef long long ll;
 
const ll MOD = 998244353;
 
// Fast exponentiation modulo mod.
ll modexp(ll a, ll b, ll mod = MOD) {
    ll res = 1;
    while(b) {
        if(b & 1) res = (res * a) % mod;
        a = (a * a) % mod;
        b /= 2;
    }
    return res;
}
 
// Precompute factorials and inverse factorials up to maxN.
void precomputeFactorials(vector<ll>& fact, vector<ll>& invfact, int maxN) {
    fact.resize(maxN+1);
    invfact.resize(maxN+1);
    fact[0] = 1;
    for (int i = 1; i <= maxN; i++){
        fact[i] = (fact[i-1]*i) % MOD;
    }
    invfact[maxN] = modexp(fact[maxN], MOD-2, MOD);
    for (int i = maxN; i > 0; i--){
        invfact[i-1] = (invfact[i]*i) % MOD;
    }
}
 
// Compute n choose k mod MOD.
ll binom(int n, int k, const vector<ll>& fact, const vector<ll>& invfact) {
    if(k < 0 || k > n) return 0;
    return ((fact[n] * invfact[k]) % MOD * invfact[n-k]) % MOD;
}
 
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
 
    int t;
    cin >> t;
 
    // We need factorials up to at least 500,000.
    const int MAX = 500000;
    vector<ll> fact, invfact;
    precomputeFactorials(fact, invfact, MAX);
 
    while(t--){
        vector<int> c(26);
        int n = 0;
        for (int i = 0; i < 26; i++){
            cin >> c[i];
            n += c[i];
        }
 
        int O = (n + 1) / 2;  // odd positions count
        int E = n / 2;        // even positions count
 
        // dp[i][j] = ways after processing i letters, with j odd positions used.
        // We'll use one-dimensional DP and update letter by letter.
        vector<ll> dp(O+1, 0), ndp(O+1, 0);
        dp[0] = 1;
        int sumSoFar = 0; // total letters placed so far.
 
        // Process each letter (from 0 to 25).
        for (int i = 0; i < 26; i++){
            fill(ndp.begin(), ndp.end(), 0);
            int cnt = c[i];
            // New total after processing letter i.
            int newSum = sumSoFar + cnt;
            // For every possible number of odd positions used so far.
            for (int j = 0; j <= O; j++){
                if(dp[j] == 0) continue;
                // Option 1: Place letter i entirely in odd positions.
                if(O - j >= cnt) {
                    // Ways to choose cnt positions among the remaining odd ones.
                    ll waysOdd = binom(O - j, cnt, fact, invfact);
                    ndp[j + cnt] = (ndp[j + cnt] + dp[j] * waysOdd) % MOD;
                }
                // Option 2: Place letter i entirely in even positions.
                // Already placed even count = (sumSoFar - j), so remaining even = E - (sumSoFar - j).
                if(E - (sumSoFar - j) >= cnt) {
                    ll waysEven = binom(E - (sumSoFar - j), cnt, fact, invfact);
                    ndp[j] = (ndp[j] + dp[j] * waysEven) % MOD;
                }
            }
            dp.swap(ndp);
            sumSoFar = newSum;
        }
 
        // We must have used exactly O odd positions.
        cout << dp[O] % MOD << "\n";
    }
 
    return 0;
}
