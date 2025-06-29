#include<bits/stdc++.h>
using namespace std;

#pragma GCC target("popcnt")
#pragma GCC optimize("Ofast")
#pragma GCC target("sse,sse2,sse3,ssse3,sse4,popcnt,abm,mmx,avx,avx2,fma")
#pragma GCC optimize("unroll-loops")

#define ll long long 
#define vll vector<long long>
#define all(a) a.begin(), a.end()   
#define getmat(a,n,m) vector<vll> a(n,vll(m)); for(ll i=0;i<n;i++) {for(ll j=0;j<m;j++) cin>>a[i][j];} 
#define printmat(a) for(auto row:a){for(ll i=0;i<row.size();i++)cout<<row[i]<<" ";cout<<endl;}
#define YES cout<<"YES\n";
#define NO cout<<"NO\n";
const ll INF = 1e18;
const ll mod = 1e9 + 7;

vector<ll> fact, inv_fact;

ll mod_exp(ll a, ll b, ll mod) {
    ll result = 1;
    while (b) {
        if (b & 1) result = (result * a) % mod;
        a = (a * a) % mod;
        b >>= 1;
    }
    return result;
}

void precompute_factorials(ll n, ll mod) {
    fact.resize(n + 1);
    inv_fact.resize(n + 1);
    fact[0] = 1;
    for (ll i = 1; i <= n; i++) {
        fact[i] = (fact[i] * i) % mod;
    }
    inv_fact[n] = mod_exp(fact[n], mod - 2, mod);
    for (ll i = n - 1; i >= 0; i--) {
        inv_fact[i] = (inv_fact[i + 1] * (i + 1)) % mod;
    }
}

ll ncr(ll n, ll r, ll mod) {
    if (r > n || r < 0) return 0;
    return fact[n] * inv_fact[r] % mod * inv_fact[n - r] % mod;
}
ll power(ll a, ll b, ll mod = 0) {
    ll result = 1;
    if (mod != 0) a %= mod;
    while (b) {
        if (b & 1) result = (mod != 0) ? (result * a) % mod : result * a;
        a = (mod != 0) ? (a * a) % mod : a * a;
        b >>= 1;
    }
    return result;
}

string tobin(ll a) {
    string s;
    while (a > 0) {
        s += (a % 2 == 1) ? '1' : '0';
        a >>= 1;
    }
    reverse(s.begin(), s.end());
    return s.empty() ? "0" : s;
}
ll toint(string s) {
    ll num = 0;
    for (char c : s) {
        num = (num << 1) + (c - '0');
    }
    return num;
}
bool isPrime(ll n)
{
    for (int i = 2; i * i <= n; i++)
    {
        if (n % i == 0)
            return 0;
    }
    return 1;
}
bool ispowerof2(ll x) {
    return x && !(x & (x - 1));
}
ll nearestPowerOf2(ll x) {
    if (x <= 0) return 1;
    ll power = 1;
    while (power < x) {
        power <<= 1;
    }
    return power;
}
ll query(ll l,ll r)
{ 
    cout << "? " << l << " " << r;
    cout<<endl;
    cout.flush(); 
    ll res;
    cin >> res;
    return res;
}

void solve(){
    int n;
    cin>>n;
    vector<int> a(n);
    for(int i = 0;i<n;i++){
        cin>>a[i];
        a[i]-=i;
    }
    int ans = 0;
    for(int i = 0;i<n;i++){
        if(a[i]<=0){
            cout<<i<<endl;
            return;
        }
    }
    cout<<*min_element(a.begin(), a.end())+min_element(a.begin(), a.end()) - a.begin()<<endl;
}
int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    ll t = 1;
    cin>>t;
    while(t--){
        solve();
    }
return 0;
}